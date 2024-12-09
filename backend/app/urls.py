from django.urls import path
from rest_framework_simplejwt import views as jwt_views
from .views import LoanListView, LoginView, RegisterView,update_policy,get_all_loans,DashboardDataView, delete_policy,TransactionDeleteView, TransactionUpdateView, LoanUpdateView,LoanDeleteView, savings_view,delete_savings_view,update_savings_view, get_savings_view,  TransactionListView, UserView, LogoutView, TransactionCreateView, get_policies, add_policy, LoanView, TokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
urlpatterns = [
    # Login_User
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'), 
    path('user/', UserView.as_view(), name='user'),  #View the user
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # Add_policy
    path('add-policy/', add_policy, name='add_policy'),  #To add policy
    path('get-policies/', get_policies, name='get_policies'),
    path('update-policy/<int:policy_id>/', update_policy, name='update-policy'),
    path('delete-policy/<int:policy_id>/', delete_policy, name='delete-policy'),

    #Add_Loan
    path('loan/', LoanView.as_view(), name='loan'),
    # path('loans/reminders/', LoanReminderListView.as_view(), name='loan_reminder_list'),  
    path('loan/<int:loan_id>/update/', LoanUpdateView.as_view(), name='loan-update'),
    path('loan/<int:loan_id>/delete/', LoanDeleteView.as_view(), name='loan-delete'),
    #Transaction
    path('transactions/', TransactionCreateView.as_view(), name='transaction'),
    path('transactionsList/', TransactionListView.as_view(), name='transaction_list'),  # GET to retrieve transactions
     path('transaction/<int:transaction_id>/update/', TransactionUpdateView.as_view(), name='transaction-update'),
    path('transaction/<int:transaction_id>/delete/', TransactionDeleteView.as_view(), name='transaction-delete'),
   #Savings
      path('savings/', savings_view, name='savings'),
      path('savingsList/', get_savings_view, name='get_savings'),
      path('savings/<int:savings_id>/update/', update_savings_view, name='update-savings'),
    path('savings/<int:savings_id>/delete/', delete_savings_view, name='delete-savings'),
    #used to generate a pair of JWT tokens:
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    #used to generate a new Access Token using a valid Refresh Token

    path('loansda/', views.get_all_loans, name='get_all_loans'),
    path('dashboard-data/', DashboardDataView, name='dashboard-data'),
path('loans/all/', LoanListView.as_view(), name='loan_list'),

]

