from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User


class Food(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="custom_foods",
    )

    name = models.CharField(max_length=200)

    serving_size = models.FloatField(default=100)
    serving_unit = models.CharField(
        max_length=20,
        default="g",
    )

    calories = models.FloatField()

    protein = models.FloatField(default=0)
    carbs = models.FloatField(default=0)
    fat = models.FloatField(default=0)

    is_custom = models.BooleanField(default=False)

    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class DiaryEntry(models.Model):
    MEAL_CHOICES = [
        ("Breakfast", "Breakfast"),
        ("Lunch", "Lunch"),
        ("Snacks", "Snacks"),
        ("Dinner", "Dinner"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    food = models.ForeignKey(
        Food,
        on_delete=models.CASCADE
    )

    meal = models.CharField(
        max_length=20,
        choices=MEAL_CHOICES
    )

    amount = models.FloatField(default=100)

    date = models.DateField(
        default=timezone.localdate
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.food.name} - {self.meal}"


class WaterEntry(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    amount = models.FloatField()

    date = models.DateField(
        default=timezone.localdate
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.amount} ml - {self.date}"

class UserProfile(models.Model):
    ACTIVITY_LEVELS = [
        ("sedentary", "Sedentary"),
        ("light", "Lightly Active"),
        ("moderate", "Moderately Active"),
        ("active", "Very Active"),
    ]

    GOAL_CHOICES = [
        ("lose", "Lose Weight"),
        ("maintain", "Maintain Weight"),
        ("gain", "Gain Weight"),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    height = models.FloatField(
        null=True,
        blank=True
    )

    weight = models.FloatField(
        null=True,
        blank=True
    )

    target_weight = models.FloatField(
        null=True,
        blank=True
    )

    activity_level = models.CharField(
        max_length=20,
        choices=ACTIVITY_LEVELS,
        default="sedentary"
    )

    goal = models.CharField(
        max_length=20,
        choices=GOAL_CHOICES,
        default="maintain"
    )

    calorie_goal = models.IntegerField(
        default=2000
    )

    protein_goal = models.FloatField(
    default=150
    )

    carb_goal = models.FloatField(
        default=250
    )

    fat_goal = models.FloatField(
        default=70
    )

    water_goal = models.FloatField(
        default=2.5
    )

    def __str__(self):
        return f"{self.user.username}'s Profile"