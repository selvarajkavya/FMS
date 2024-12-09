from rest_framework import serializers
from .models import User, Policy, Loan, Transaction, Savings
import calendar
from django.utils import timezone
from datetime import timedelta
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


# Login_User
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'username', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

# Policy
class PolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = Policy
        fields = [
            'id',
            'user',  # User must be authenticated and passed when creating the policy
            'policy_no',
            'policy_amount',
            'policy_start_date',  # Ensure this exists in your model
            'policy_due_date',
            'policy_method',
            'next_due_date'
        ]

    def validate_policy_no(self, value):
        if Policy.objects.filter(policy_no=value).exists():
            raise serializers.ValidationError("Policy number already exists.")
        return value

    def create(self, validated_data):
        # Custom creation logic if necessary (e.g., calculating due dates)
        return super().create(validated_data)

#Loan
class LoanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Loan
        fields = [
            'id',
            'user',
            'loan_category',
            'loan_type',
            'loan_amount',
            'loan_due_date',
            'next_due_date',
            'reminder_date',  # Include reminder_date
        ]
        read_only_fields = ['next_due_date', 'reminder_date']  # These are auto-calculated



class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields =['id','date', 'amount', 'description', 'transaction_type']


# serializers.py
class SavingsSerializer(serializers.ModelSerializer):
    reminder = serializers.DateField()
    class Meta:
        model = Savings
        fields = [
            'id',
            'savings_category',
            'savings_amount',
            'date',
            'due_date',
            'user', 
            'reminder'
        ]
        extra_kwargs = {
            'user': {'read_only': True},  # Prevent user field from being set in the request
        }


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['user_id'] = user.id
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Add user ID to the response data
        data['user_id'] = self.user.id
        return data
