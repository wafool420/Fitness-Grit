from rest_framework import serializers
from django.contrib.auth.models import User

from .models import Food, DiaryEntry, WaterEntry, UserProfile


class FoodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Food
        fields = [
            "id",
            "name",
            "serving_size",
            "serving_unit",
            "calories",
            "protein",
            "carbs",
            "fat",
        ]


class DiaryEntrySerializer(serializers.ModelSerializer):
    food_name = serializers.CharField(
        source="food.name",
        read_only=True
    )

    food_calories = serializers.FloatField(
        source="food.calories",
        read_only=True
    )

    food_serving_size = serializers.FloatField(
        source="food.serving_size",
        read_only=True
    )

    food_serving_unit = serializers.CharField(
        source="food.serving_unit",
        read_only=True
    )

    food_protein = serializers.FloatField(
        source="food.protein",
        read_only=True
    )

    food_carbs = serializers.FloatField(
        source="food.carbs",
        read_only=True
    )

    food_fat = serializers.FloatField(
        source="food.fat",
        read_only=True
    )

    class Meta:
        model = DiaryEntry
        fields = [
            "id",
            "food",
            "food_name",
            "food_calories",
            "food_serving_size",
            "food_serving_unit",
            "food_protein",
            "food_carbs",
            "food_fat",
            "meal",
            "amount",
            "date",
            "created_at",
        ]


class WaterEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = WaterEntry
        fields = [
            "id",
            "amount",
            "date",
            "created_at",
        ]


class UserProfileSerializer(serializers.ModelSerializer):
    name = serializers.CharField(
        source="user.first_name"
    )

    email = serializers.EmailField(
        source="user.email"
    )

    class Meta:
        model = UserProfile
        fields = [
            "name",
            "email",
            "height",
            "weight",
            "target_weight",
            "activity_level",
            "goal",
            "calorie_goal",
            "protein_goal",
            "carb_goal",
            "fat_goal",
            "water_goal",
        ]

    # -------------------------
    # EMAIL VALIDATION
    # -------------------------

    def validate_email(self, value):
        email = value.strip().lower()

        users = User.objects.filter(
            email__iexact=email
        )

        if self.instance is not None:
            users = users.exclude(
                pk=self.instance.user_id
            )

        if users.exists():
            raise serializers.ValidationError(
                "This email can't be used. Please choose a different email."
            )

        return email

    # -------------------------
    # BODY STATS VALIDATION
    # -------------------------

    def validate_height(self, value):
        if value is not None:
            if value < 50 or value > 250:
                raise serializers.ValidationError(
                    "Height must be between 50 and 250 cm."
                )

        return value

    def validate_weight(self, value):
        if value is not None:
            if value < 20 or value > 500:
                raise serializers.ValidationError(
                    "Weight must be between 20 and 500 kg."
                )

        return value

    def validate_target_weight(self, value):
        if value is not None:
            if value < 20 or value > 500:
                raise serializers.ValidationError(
                    "Goal weight must be between 20 and 500 kg."
                )

        return value

    # -------------------------
    # DAILY GOALS VALIDATION
    # -------------------------

    def validate_calorie_goal(self, value):
        if value < 500 or value > 10000:
            raise serializers.ValidationError(
                "Calorie goal must be between 500 and 10,000 kcal."
            )

        return value

    def validate_protein_goal(self, value):
        if value < 0 or value > 500:
            raise serializers.ValidationError(
                "Protein goal must be between 0 and 500 g."
            )

        return value

    def validate_carb_goal(self, value):
        if value < 0 or value > 1000:
            raise serializers.ValidationError(
                "Carb goal must be between 0 and 1,000 g."
            )

        return value

    def validate_fat_goal(self, value):
        if value < 0 or value > 500:
            raise serializers.ValidationError(
                "Fat goal must be between 0 and 500 g."
            )

        return value

    def validate_water_goal(self, value):
        if value < 0.5 or value > 15:
            raise serializers.ValidationError(
                "Water goal must be between 0.5 and 15 L."
            )

        return value

    # -------------------------
    # UPDATE USER + PROFILE
    # -------------------------

    def update(self, instance, validated_data):
        user_data = validated_data.pop(
            "user",
            {}
        )

        user = instance.user

        if "first_name" in user_data:
            user.first_name = (
                user_data["first_name"].strip()
            )

        if "email" in user_data:
            email = (
                user_data["email"]
                .strip()
                .lower()
            )

            user.email = email
            user.username = email

        user.save()

        return super().update(
            instance,
            validated_data
        )