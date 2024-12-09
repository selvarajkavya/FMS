from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import AnonymousUser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView
from .serializers import TransactionSerializer,  UserSerializer, PolicySerializer, LoanSerializer, SavingsSerializer
from .models import User, Policy, Loan, Transaction, Savings
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework import status
from datetime import datetime, timedelta
from django.db import models
from django.http import JsonResponse
from dateutil.relativedelta import relativedelta
from datetime import timedelta
from django.utils.timezone import now
from django.db.models import Q
from collections import Counter
from rest_framework.authentication import get_authorization_header
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import ValidationError
from django.db.models import Sum, Case, When
from django.contrib.auth.models import User
from rest_framework.authentication import TokenAuthentication
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer


# Login_User
class RegisterView(APIView):
    permission_classes = []  

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


# class LoginView(TokenObtainPairView):
#     pass

class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user 
        serializer = UserSerializer(user)
        return Response(serializer.data)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        response = Response()
        response.delete_cookie('jwt')
        response.data = {
            'message': 'Logged out successfully'
        }
        return response

#Refresh endpoint
@api_view(['POST'])
def TokenRefreshView(request):
    TokenRefreshView = request.data.get("TokenRefreshView")
    if not TokenRefreshView:
        return Response({"detail": "Refresh token required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        refresh = TokenRefreshView(TokenRefreshView)
        new_access_token = str(refresh.access_token)
        return Response({"access_token": new_access_token})
    except Exception:
        return Response({"detail": "Invalid refresh token."}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def add_policy(request):
    try:
        token = get_authorization_header(request).split()[1].decode('utf-8')
        print(f"Access Token: {token}")
    except Exception as e:
        return Response({"error": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)

    user = request.user  
    policy_no = request.data.get('policy_no')
    policy_amount = request.data.get('policy_amount')
    start_date = request.data.get('start_date')  # Get start date from request
    policy_method = request.data.get('policy_method')

    if Policy.objects.filter(policy_no=policy_no).exists():
        return Response({"error": f"Policy with number {policy_no} already exists."}, status=status.HTTP_400_BAD_REQUEST)

    if start_date:
        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        except ValueError:
            return Response({"error": "Invalid date format. Use 'YYYY-MM-DD'."}, status=status.HTTP_400_BAD_REQUEST)

        next_due_date = None
        if policy_method == 'monthly':
            next_due_date = start_date + relativedelta(months=1)
        elif policy_method == 'quarterly':
            next_due_date = start_date + relativedelta(months=3)
        elif policy_method == 'half_yearly':
            next_due_date = start_date + relativedelta(months=6)
        elif policy_method == 'annual':
            next_due_date = start_date + relativedelta(years=1)
        else:
            return Response({"error": "Invalid policy method."}, status=status.HTTP_400_BAD_REQUEST)

        reminder_date = next_due_date - timedelta(days=7)
    else:
        return Response({"error": "Start date is required."}, status=status.HTTP_400_BAD_REQUEST)

    data = {
        'user': user.id,  
        'policy_no': policy_no,
        'policy_amount': policy_amount,
        'start_date': start_date.strftime('%Y-%m-%d'),  # Include start date
        'policy_due_date': next_due_date.strftime('%Y-%m-%d'),
        'policy_method': policy_method,
    }

    serializer = PolicySerializer(data=data)
    if serializer.is_valid():
        policy = serializer.save()
        policy.reminder_date = reminder_date  # Save the reminder date
        policy.save()

        return Response(
            {"message": "Policy created successfully!", "next_due_date": next_due_date, "reminder_date": reminder_date},
            status=status.HTTP_201_CREATED
        )
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_policies(request):
    try:
        user = request.user
        policies = Policy.objects.filter(user=user)
        serializer = PolicySerializer(policies, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# @api_view(['PUT'])
# @authentication_classes([JWTAuthentication])
# @permission_classes([IsAuthenticated])
# def update_policy(request, policy_no):
#     try:
#         user = request.user
#         policy = Policy.objects.filter(user=user, id=policy_no).first()

#         if not policy:
#             return Response({"error": "Policy not found."}, status=status.HTTP_404_NOT_FOUND)

#         # Get the updated fields from the request
#         policy_amount = request.data.get('policy_amount', policy.policy_amount)

#         # Handle None case for policy_start_date
#         policy_start_date = request.data.get('policy_start_date', policy.policy_start_date)

#         # If policy_start_date is provided, attempt to parse it
#         if policy_start_date:
#             try:
#                 policy_start_date = datetime.strptime(policy_start_date, '%Y-%m-%d').date()
#             except ValueError:
#                 return Response({"error": "Invalid date format. Use 'YYYY-MM-DD'."}, status=status.HTTP_400_BAD_REQUEST)
#         else:
#             # If no start_date provided, use the existing value in policy
#             policy_start_date = policy.policy_start_date

#         policy_method = request.data.get('policy_method', policy.policy_method)

#         # Log to check if the required fields are being passed
#         print(f"policy_amount: {policy_amount}, policy_start_date: {policy_start_date}, policy_method: {policy_method}")

#         # Calculate next_due_date based on policy method
#         if policy_method == 'monthly':
#             next_due_date = policy_start_date + relativedelta(months=1)
#         elif policy_method == 'quarterly':
#             next_due_date = policy_start_date + relativedelta(months=3)
#         elif policy_method == 'half_yearly':
#             next_due_date = policy_start_date + relativedelta(months=6)
#         elif policy_method == 'annual':
#             next_due_date = policy_start_date + relativedelta(years=1)
#         else:
#             return Response({"error": "Invalid policy method."}, status=status.HTTP_400_BAD_REQUEST)

#         reminder_date = next_due_date - timedelta(days=7)

#         # Update the policy fields
#         policy.policy_amount = policy_amount
#         policy.start_date = policy_start_date
#         policy.policy_due_date = next_due_date
#         policy.policy_method = policy_method
#         policy.next_due_date = next_due_date
#         policy.reminder_date = reminder_date

#         policy.save()

#         return Response(
#             {
#                 "message": f"Policy {policy_no} updated successfully.",
#                 "next_due_date": next_due_date,
#                 "reminder_date": reminder_date
#             },
#             status=status.HTTP_200_OK
#         )

#     except ValueError as e:
#         return Response({"error": f"Value error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
#     except Exception as e:
#         # Log the exception for debugging
#         print(f"Error: {str(e)}")
#         return Response({"error": f"Internal server error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def update_policy(request, policy_id):
    try:
        user = request.user
        policy = Policy.objects.filter(user=user, id=policy_id).first()

        if not policy:
            return Response({"error": "Policy not found."}, status=status.HTTP_404_NOT_FOUND)

        # Get the updated fields from the request
        policy_amount = request.data.get('policy_amount', policy.policy_amount)

        # Handle None case for policy_start_date
        policy_start_date = request.data.get('policy_start_date', policy.policy_start_date)

        # If policy_start_date is provided, attempt to parse it
        if policy_start_date:
            try:
                policy_start_date = datetime.strptime(policy_start_date, '%Y-%m-%d').date()
            except ValueError:
                return Response({"error": "Invalid date format. Use 'YYYY-MM-DD'."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            # If no start_date provided, use the existing value in policy
            policy_start_date = policy.policy_start_date

        policy_method = request.data.get('policy_method', policy.policy_method)

        # Log to check if the required fields are being passed
        print(f"policy_amount: {policy_amount}, policy_start_date: {policy_start_date}, policy_method: {policy_method}")

        # Calculate next_due_date based on policy method
        if policy_method == 'monthly':
            next_due_date = policy_start_date + relativedelta(months=1)
        elif policy_method == 'quarterly':
            next_due_date = policy_start_date + relativedelta(months=3)
        elif policy_method == 'half_yearly':
            next_due_date = policy_start_date + relativedelta(months=6)
        elif policy_method == 'annual':
            next_due_date = policy_start_date + relativedelta(years=1)
        else:
            return Response({"error": "Invalid policy method."}, status=status.HTTP_400_BAD_REQUEST)

        reminder_date = next_due_date - timedelta(days=7)

        # Update the policy fields
        policy.policy_amount = policy_amount
        policy.policy_start_date = policy_start_date  # corrected from policy.start_date to policy.policy_start_date
        policy.policy_due_date = next_due_date
        policy.policy_method = policy_method
        policy.next_due_date = next_due_date
        policy.reminder_date = reminder_date

        policy.save()

        return Response(
            {
                "message": f"Policy {policy_id} updated successfully.",
                "next_due_date": next_due_date,
                "reminder_date": reminder_date
            },
            status=status.HTTP_200_OK
        )

    except ValueError as e:
        return Response({"error": f"Value error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        # Log the exception for debugging
        print(f"Error: {str(e)}")
        return Response({"error": f"Internal server error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# views.py

@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_policy( request,policy_id):
    try:
        user = request.user
        policy = Policy.objects.filter(user=user, id=policy_id).first()

        if not policy:
            return Response({"error": "Policy not found."}, status=status.HTTP_404_NOT_FOUND)

        policy.delete()
        return Response({"message": f"Policy {policy_id} deleted successfully."}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


#Loan
class LoanView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data.copy()
        data['user'] = request.user.id

        serializer = LoanSerializer(data=data)
        if serializer.is_valid():
            loan = serializer.save()

            loan_type = data.get('loan_type')
            if loan_type == 'Monthly':
                next_due_date = loan.loan_due_date + timedelta(days=30)
            elif loan_type == 'Quarterly':
                next_due_date = loan.loan_due_date + timedelta(days=90)
            elif loan_type == 'Half-Yearly':
                next_due_date = loan.loan_due_date + timedelta(days=180)
            elif loan_type == 'Annual':
                next_due_date = loan.loan_due_date + timedelta(days=365)
            else:
                return Response({"error": "Invalid loan type"}, status=status.HTTP_400_BAD_REQUEST)

            loan.next_due_date = next_due_date
            loan.save()

            return Response({
                "message": "Loan added successfully",
                "loan": serializer.data,
                "next_due_date": next_due_date
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Loan
from .serializers import LoanSerializer

class LoanUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, loan_id):
        try:
            # Get the loan by id
            loan = Loan.objects.get(id=loan_id)

            # Update loan details with the data from the request
            serializer = LoanSerializer(loan, data=request.data, partial=True)  # partial=True for partial update
            if serializer.is_valid():
                loan = serializer.save()

                # Recalculate next_due_date and reminder_date based on the loan type
                loan_type = request.data.get('loan_type', loan.loan_type)
                # loan_type = loan_type.lower()
                if loan_type == 'monthly':
                    next_due_date = loan.loan_due_date + timedelta(days=30)
                elif loan_type == 'quarterly':
                    next_due_date = loan.loan_due_date + timedelta(days=90)
                elif loan_type == 'half_yearly':
                    next_due_date = loan.loan_due_date + timedelta(days=180)
                elif loan_type == 'annual':
                    next_due_date = loan.loan_due_date + timedelta(days=365)
                else:
                    return Response({"error": "Invalid loan type"}, status=status.HTTP_400_BAD_REQUEST)

                loan.next_due_date = next_due_date
                loan.reminder_date = loan.next_due_date - timedelta(days=7)  # Reminder 7 days before due date
                loan.save()

                return Response({
                    "message": "Loan updated successfully",
                    "loan": serializer.data,
                    "next_due_date": next_due_date
                }, status=status.HTTP_200_OK)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Loan.DoesNotExist:
            return Response({"error": "Loan not found"}, status=status.HTTP_404_NOT_FOUND)


class LoanDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, loan_id):
        try:
            # Get the loan by id
            loan = Loan.objects.get(id=loan_id)
            loan.delete()  # Delete the loan

            return Response({
                "message": "Loan deleted successfully"
            }, status=status.HTTP_204_NO_CONTENT)

        except Loan.DoesNotExist:
            return Response({"error": "Loan not found"}, status=status.HTTP_404_NOT_FOUND)


# class TransactionView(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]
#     def post(self, request):
#         data = request.data
#         serializer = TransactionSerializer(data=data)
#         if serializer.is_valid():
#             serializer.save(
#                 user=request.user,
#                 created_by=request.user.username,
#                 dtm_created=datetime.now()
#             )
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TransactionCreateView(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data  # Use the data as provided
        serializer = TransactionSerializer(data=data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# class TransactionListView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         user = request.user
#         transactions = Transaction.objects.filter(user=user, deleted=0)
#         serializer = TransactionSerializer(transactions, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)


class TransactionListView(APIView):
    def get(self, request, *args, **kwargs):
        transactions = Transaction.objects.all()  
        serializer = TransactionSerializer(transactions, many=True)  # Serialize the queryset
        return Response(serializer.data, status=status.HTTP_200_OK)

# class TransactionListView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         user = request.user
#         # Filtering transactions by user and ensuring only non-deleted transactions are included
#         transactions = Transaction.objects.filter(user=user, deleted=0)
#         # Serializing the data
#         serializer = TransactionSerializer(transactions, many=True)

#         # Returning a successful response with the serialized data
#         return Response({
#             "message": "Transactions retrieved successfully",
#             "transactions": serializer.data
#         }, status=status.HTTP_200_OK)

class TransactionUpdateView(APIView):
    def put(self, request, transaction_id):
        try:
            # Get the transaction by ID
            transaction = Transaction.objects.get(id=transaction_id)
            
            # Update the transaction details with the data from the request
            serializer = TransactionSerializer(transaction, data=request.data, partial=True)  # partial=True for partial update
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "message": "Transaction updated successfully",
                    "transaction": serializer.data
                }, status=status.HTTP_200_OK)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        except Transaction.DoesNotExist:
            return Response({"error": "Transaction not found"}, status=status.HTTP_404_NOT_FOUND)
class TransactionDeleteView(APIView):
    def delete(self, request, transaction_id):
        try:
            # Get the transaction by ID
            transaction = Transaction.objects.get(id=transaction_id)
            transaction.delete()  # Delete the transaction

            return Response({
                "message": "Transaction deleted successfully"
            }, status=status.HTTP_204_NO_CONTENT)
        except Transaction.DoesNotExist:
            return Response({"error": "Transaction not found"}, status=status.HTTP_404_NOT_FOUND)
    
from datetime import datetime
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import SavingsSerializer
from .models import Savings

from datetime import datetime
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import Savings
from .serializers import SavingsSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def savings_view(request):
    user = request.user  # Get the authenticated user

    # Parse incoming data
    data = request.data

    # Get the date provided in the request, defaulting to the current date if not provided
    savings_date = data.get('date', None)
    if savings_date:
        try:
            date_obj = datetime.strptime(savings_date, '%Y-%m-%d')
        except ValueError:
            return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)
    else:
        date_obj = datetime.now()

    # Set reminder date as the 1st of the month (just the date, not datetime)
    reminder_date = date_obj.replace(day=1).date()  # Only the date part
    data['reminder'] = reminder_date  # Store as date only

    # Get the due date provided in the request, if any, or set it to None
    due_date = data.get('due_date', None)
    if due_date:
        try:
            due_date_obj = datetime.strptime(due_date, '%Y-%m-%d').date()
            data['due_date'] = due_date_obj
        except ValueError:
            return Response({"error": "Invalid due_date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)
    
    # Initialize the serializer with incoming data
    serializer = SavingsSerializer(data=data)

    if serializer.is_valid():
        # Explicitly set the user field when saving
        serializer.save(user=user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_savings_view(request):
    user = request.user  # Get the authenticated user

    # Fetch savings records for the authenticated user
    savings_records = Savings.objects.filter(user=user)

    # Serialize the savings data
    serializer = SavingsSerializer(savings_records, many=True)

    return Response({
        "message": "Savings records retrieved successfully",
        "savings": serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_savings_view(request, savings_id):
    user = request.user  # Get the authenticated user
    
    try:
        # Get the savings record for the given ID and ensure it belongs to the user
        savings_record = Savings.objects.get(id=savings_id, user=user)
    except Savings.DoesNotExist:
        return Response({"error": "Savings record not found or not authorized to access."}, status=status.HTTP_404_NOT_FOUND)

    # Parse incoming data and validate using the serializer
    data = request.data

    # Optional: Update reminder or due date logic if provided in the request
    savings_date = data.get('date', None)
    if savings_date:
        try:
            date_obj = datetime.strptime(savings_date, '%Y-%m-%d')
            data['reminder'] = date_obj.replace(day=1).date()  # Update reminder date
        except ValueError:
            return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

    due_date = data.get('due_date', None)
    if due_date:
        try:
            data['due_date'] = datetime.strptime(due_date, '%Y-%m-%d').date()
        except ValueError:
            return Response({"error": "Invalid due_date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

    # Initialize the serializer with the instance and incoming data
    serializer = SavingsSerializer(savings_record, data=data, partial=True)  # Partial update
    if serializer.is_valid():
        serializer.save()
        return Response({
            "message": "Savings record updated successfully",
            "savings": serializer.data
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_savings_view(request, savings_id):
    user = request.user  # Get the authenticated user
    
    try:
        # Get the savings record for the given ID and ensure it belongs to the user
        savings_record = Savings.objects.get(id=savings_id, user=user)
    except Savings.DoesNotExist:
        return Response({"error": "Savings record not found or not authorized to access."}, status=status.HTTP_404_NOT_FOUND)

    # Delete the record
    savings_record.delete()
    return Response({"message": "Savings record deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


def get_all_loans(request):
    loans = Loan.objects.all()
    policies = Policy.objects.all()
    savings = Savings.objects.all()

    # Serialize the data
    loan_data = LoanSerializer(loans, many=True).data
    policy_data = PolicySerializer(policies, many=True).data
    savings_data = SavingsSerializer(savings, many=True).data

    # Merge loan, policy, and savings data
    for loan in loan_data:
      policy = next((p for p in policy_data if p['policy_no'] == loan.get('policy_no')), None)
      if policy:
        print(f"Matched policy for loan {loan.get('policy_no')}: {policy}")
        loan['policy_amount'] = policy['policy_amount']
        loan['next_due_date'] = policy['next_due_date']
        loan['policy_method'] = policy ['policy_method']
    else:
        print(f"No policy matched for loan {loan.get('policy_no')}")

        savings = next((s for s in savings_data if s['user'] == loan['user']), None)
        if savings:
            loan['savings_category'] = savings['savings_category']
            loan['savings_amount'] = savings['savings_amount']
            loan['savings_due_date'] = savings['due_date']
            loan['savings_reminder'] = savings['reminder']

    # Optionally, add savings information
    for loan in loan_data:
        savings = next((s for s in savings_data if s['user'] == loan['user']), None)  # Assuming 'user' links savings and loan
        if savings:
            loan['savings_category'] = savings['savings_category']
            loan['savings_amount'] = savings['savings_amount']
            loan['reminder'] = savings['reminder']


    return JsonResponse(loan_data, safe=False)





def DashboardDataView(request):
    # Count transactions by type
    transaction_data = Transaction.objects.values('transaction_type')
    transaction_count = Counter([item['transaction_type'] for item in transaction_data])

    # Count savings by category
    savings_data = Savings.objects.values('savings_category')
    savings_count = Counter([item['savings_category'] for item in savings_data])

    # Prepare data for pie chart
    pie_chart_data = {
        "transactions": dict(transaction_count),
        "savings": dict(savings_count)
    }

    return JsonResponse(pie_chart_data)

# friday
class LoanListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        loans = Loan.objects.filter(user=request.user).order_by('next_due_date')
        serializer = LoanSerializer(loans, many=True)
        return Response({
            "message": "All loans retrieved successfully",
            "loans": serializer.data
        }, status=status.HTTP_200_OK)