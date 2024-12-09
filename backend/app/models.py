from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from datetime import timedelta

# AppInfo Model
class AppInfo(models.Model):
    info_code = models.CharField(max_length=50, null=True, blank=True)
    info_value = models.CharField(max_length=255, null=True, blank=True)
    deleted = models.IntegerField(null=True, blank=True, default=0)
    created_by = models.CharField(max_length=100, null=True, blank=True)
    dtm_created = models.DateTimeField(auto_now_add=True) 
    modified_by = models.CharField(max_length=100, null=True, blank=True)
    dtm_modified = models.DateTimeField(auto_now=True)  
    remarks = models.TextField(max_length=1000, null=True, blank=True)
    dev_remarks = models.TextField(max_length=1000, null=True, blank=True)

    def __str__(self):
        return self.info_code or "AppInfo"

# Login_User
class User(AbstractUser):
    username = models.CharField(max_length=255, unique=True)
    name = models.CharField(max_length=255)
    email = None  # Set email to None

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.username

#Policy
class Policy(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='policies'
    )
    id = models.AutoField(primary_key=True)
    policy_no = models.CharField(max_length=255, null=True, blank=True, unique=True)
    policy_amount = models.IntegerField(null=True, blank=True)
    policy_start_date = models.DateField(null=True, blank=True)
    policy_due_date = models.DateField(null=True, blank=True)
    policy_method = models.CharField(max_length=50, null=True, blank=True)
    next_due_date = models.DateField(null=True, blank=True)
    reminder_date = models.DateField(null=True, blank=True)
    deleted = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    dtm_created = models.DateTimeField(auto_now_add=True)
    modified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="policy_modified")
    dtm_modified = models.DateTimeField(auto_now=True)
    remarks = models.TextField(max_length=1000, null=True, blank=True)
    dev_remarks = models.TextField(max_length=1000, null=True, blank=True)

    def get_reminder(self):
        if self.policy_due_date:
            # Example reminder logic: Notify 1 week before due date
            return self.policy_due_date - timedelta(days=7)
        return None

    def __str__(self):
        return self.policy_no or "Policy"

#Loan
class Loan(models.Model):
    id = models.AutoField(primary_key=True)
    loan_category = models.CharField(max_length=255, null=True, blank=True)
    loan_type = models.CharField(max_length=50, null=True, blank=True)
    loan_amount = models.IntegerField(null=True, blank=True)
    loan_due_date = models.DateField(null=True, blank=True)
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    next_due_date = models.DateField(null=True, blank=True)
    reminder_date = models.DateField(null=True, blank=True)  # New field for reminder
    deleted = models.IntegerField(null=True, blank=True, default=0)
    created_by = models.CharField(max_length=100, null=True, blank=True)
    dtm_created = models.DateTimeField(null=True, blank=True)
    modified_by = models.CharField(max_length=100, null=True, blank=True)
    dtm_modified = models.DateTimeField(null=True, blank=True)
    remarks = models.TextField(max_length=1000, null=True, blank=True)
    dev_remarks = models.TextField(max_length=1000, null=True, blank=True)

    def save(self, *args, **kwargs):
        # Automatically set `next_due_date` and `reminder_date` before saving
        if self.loan_due_date and self.loan_type:
            loan_type_days = {
                'Monthly': 30,
                'Quarterly': 90,
                'Half-Yearly': 180,
                'Annual': 365
            }
            duration = loan_type_days.get(self.loan_type)
            if duration:
                self.next_due_date = self.loan_due_date + timedelta(days=duration)
                self.reminder_date = self.next_due_date - timedelta(days=7)  # Reminder one week before due date

        super(Loan, self).save(*args, **kwargs)



class Transaction(models.Model):
    # General fields
    id = models.AutoField(primary_key=True)
    date = models.DateField(null=True, blank=True)
    amount = models.IntegerField(null=True, blank=True)
    description = models.TextField(max_length=1000, null=True, blank=True)
    user = models.ForeignKey('User', null=True,
        blank=True, on_delete=models.CASCADE)  # Assuming 'User' model exists
    deleted = models.IntegerField(null=True, blank=True, default=0)
    created_by = models.CharField(max_length=100, null=True, blank=True)
    dtm_created = models.DateTimeField(null=True, blank=True)
    modified_by = models.CharField(max_length=100, null=True, blank=True)
    dtm_modified = models.DateTimeField(null=True, blank=True)
    remarks = models.TextField(max_length=1000, null=True, blank=True)
    dev_remarks = models.TextField(max_length=1000, null=True, blank=True)

    # Transaction type (handled by frontend)
    transaction_type = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"{self.transaction_type} - {self.amount}"


class Savings(models.Model):
    id = models.AutoField(primary_key=True)
    savings_category = models.CharField(max_length=255, null=True, blank=True)
    savings_amount = models.IntegerField(null=True, blank=True)
    date = models.DateField(null=True, blank=True)
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    deleted = models.IntegerField(null=True, blank=True, default=0)
    created_by = models.CharField(max_length=100, null=True, blank=True)
    dtm_created = models.DateTimeField(null=True, blank=True)
    modified_by = models.CharField(max_length=100, null=True, blank=True)
    dtm_modified = models.DateTimeField(null=True, blank=True)
    remarks = models.TextField(max_length=1000, null=True, blank=True)
    dev_remarks = models.TextField(max_length=1000, null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    reminder = models.DateField(null=True, blank=True)

