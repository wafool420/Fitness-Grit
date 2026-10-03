from django.contrib import admin
from .models import Food


@admin.register(Food)
class FoodAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "serving_size",
        "serving_unit",
        "calories",
        "protein",
        "carbs",
        "fat",
    )

    search_fields = ("name",)