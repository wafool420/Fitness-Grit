import requests
from django.conf import settings

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Max
from django.utils import timezone

from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Food, DiaryEntry, WaterEntry, UserProfile
from .serializers import (
    FoodSerializer,
    DiaryEntrySerializer,
    WaterEntrySerializer,
    UserProfileSerializer,
)


# =========================================================
# TEST API
# =========================================================

@api_view(["GET"])
@permission_classes([AllowAny])
def test_api(request):
    return Response({
        "message": "Fitness Gurt API is working!"
    })


# =========================================================
# REGISTER
# =========================================================

@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request):
    name = request.data.get("name", "").strip()
    email = request.data.get("email", "").strip().lower()
    password = request.data.get("password", "")

    if not name or not email or not password:
        return Response(
            {
                "error": "Name, email, and password are required."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(username=email).exists():
        return Response(
            {
                "error": "An account with this email already exists."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(email=email).exists():
        return Response(
            {
                "error": "An account with this email already exists."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name=name,
    )

    # Make sure every new user has a profile.
    UserProfile.objects.get_or_create(user=user)

    token, _ = Token.objects.get_or_create(user=user)

    return Response(
        {
            "token": token.key,
            "user": {
                "id": user.id,
                "name": user.first_name,
                "email": user.email,
            },
        },
        status=status.HTTP_201_CREATED,
    )


# =========================================================
# LOGIN
# =========================================================

@api_view(["POST"])
@permission_classes([AllowAny])
def login_user(request):
    email = request.data.get("email", "").strip().lower()
    password = request.data.get("password", "")

    if not email or not password:
        return Response(
            {
                "error": "Email and password are required."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(
        username=email,
        password=password,
    )

    if user is None:
        return Response(
            {
                "error": "Invalid email or password."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    UserProfile.objects.get_or_create(user=user)

    token, _ = Token.objects.get_or_create(user=user)

    return Response({
        "token": token.key,
        "user": {
            "id": user.id,
            "name": user.first_name,
            "email": user.email,
        },
    })


# =========================================================
# CURRENT USER
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):
    return Response({
        "id": request.user.id,
        "name": request.user.first_name,
        "email": request.user.email,
    })


# =========================================================
# FOOD LIST
# Global food database
# =========================================================

@api_view(["GET", "POST"])
def food_list(request):

    # -----------------------------------------------------
    # GET ALL FOODS
    # -----------------------------------------------------

    if request.method == "GET":
        foods = Food.objects.all().order_by("name")

        serializer = FoodSerializer(
            foods,
            many=True,
        )

        return Response(serializer.data)

    # -----------------------------------------------------
    # CREATE FOOD
    # -----------------------------------------------------

    serializer = FoodSerializer(
        data=request.data,
    )

    if serializer.is_valid():
        serializer.save()

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST,
    )


# =========================================================
# RECENT FOODS
# Foods recently logged by THIS user
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def recent_foods(request):

    recent_entries = (
        DiaryEntry.objects
        .filter(
            user=request.user,
            food__is_deleted=False,
        )
        .values("food")
        .annotate(last_used=Max("created_at"))
        .order_by("-last_used")[:4]
    )

    food_ids = [
        entry["food"]
        for entry in recent_entries
    ]

    foods_by_id = {
        food.id: food
        for food in Food.objects.filter(
            id__in=food_ids,
            is_deleted=False,
        )
    }

    ordered_foods = [
        foods_by_id[food_id]
        for food_id in food_ids
        if food_id in foods_by_id
    ]

    serializer = FoodSerializer(
        ordered_foods,
        many=True,
    )

    return Response(serializer.data)


# =========================================================
# DIARY
# GET:
#   /api/diary/
#   /api/diary/?date=YYYY-MM-DD
#   /api/diary/?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
#
# POST:
#   Create diary entry for logged-in user
# =========================================================

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def diary_list(request):

    # -----------------------------------------------------
    # GET DIARY
    # -----------------------------------------------------

    if request.method == "GET":

        date = request.GET.get("date")
        start_date = request.GET.get("start_date")
        end_date = request.GET.get("end_date")

        entries = DiaryEntry.objects.filter(
            user=request.user
        )

        # Exact date takes priority.
        if date:
            entries = entries.filter(
                date=date
            )

        # Otherwise use a range.
        elif start_date and end_date:
            entries = entries.filter(
                date__range=[
                    start_date,
                    end_date,
                ]
            )

        entries = entries.order_by(
            "date",
            "created_at",
        )

        serializer = DiaryEntrySerializer(
            entries,
            many=True,
        )

        return Response(serializer.data)

    # -----------------------------------------------------
    # CREATE DIARY ENTRY
    # -----------------------------------------------------

    serializer = DiaryEntrySerializer(
        data=request.data,
    )

    if serializer.is_valid():

        serializer.save(
            user=request.user
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST,
    )


# =========================================================
# DIARY DETAIL
# PATCH / DELETE
# Only the owner can modify the entry.
# =========================================================

@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def diary_detail(request, entry_id):

    try:
        entry = DiaryEntry.objects.get(
            pk=entry_id,
            user=request.user,
        )

    except DiaryEntry.DoesNotExist:
        return Response(
            {
                "error": "Diary entry not found."
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    # -----------------------------------------------------
    # GET ONE ENTRY
    # -----------------------------------------------------

    if request.method == "GET":

        serializer = DiaryEntrySerializer(
            entry
        )

        return Response(serializer.data)

    # -----------------------------------------------------
    # UPDATE ENTRY
    # -----------------------------------------------------

    if request.method == "PATCH":

        serializer = DiaryEntrySerializer(
            entry,
            data=request.data,
            partial=True,
        )

        if serializer.is_valid():

            serializer.save(
                user=request.user
            )

            return Response(
                serializer.data
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    # -----------------------------------------------------
    # DELETE ENTRY
    # -----------------------------------------------------

    entry.delete()

    return Response(
        status=status.HTTP_204_NO_CONTENT
    )


# =========================================================
# WATER
#
# GET:
#   /api/water/
#   /api/water/?date=YYYY-MM-DD
#   /api/water/?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
#
# POST:
#   Create water entry for logged-in user
#
# IMPORTANT:
# amount is stored in mL.
# =========================================================

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def water_list(request):

    # -----------------------------------------------------
    # GET WATER
    # -----------------------------------------------------

    if request.method == "GET":

        date = request.GET.get("date")
        start_date = request.GET.get("start_date")
        end_date = request.GET.get("end_date")

        entries = WaterEntry.objects.filter(
            user=request.user
        )

        # Exact date takes priority.
        if date:
            entries = entries.filter(
                date=date
            )

        # Otherwise use date range.
        elif start_date and end_date:
            entries = entries.filter(
                date__range=[
                    start_date,
                    end_date,
                ]
            )

        entries = entries.order_by(
            "date",
            "created_at",
        )

        serializer = WaterEntrySerializer(
            entries,
            many=True,
        )

        return Response(serializer.data)

    # -----------------------------------------------------
    # CREATE WATER ENTRY
    # -----------------------------------------------------

    serializer = WaterEntrySerializer(
        data=request.data,
    )

    if serializer.is_valid():

        serializer.save(
            user=request.user
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST,
    )


# =========================================================
# USER PROFILE
#
# GET:
#   Get profile for logged-in user
#
# PATCH:
#   Update profile/goals
# =========================================================

@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def user_profile(request):

    profile, _ = UserProfile.objects.get_or_create(
        user=request.user
    )

    # -----------------------------------------------------
    # GET PROFILE
    # -----------------------------------------------------

    if request.method == "GET":

        serializer = UserProfileSerializer(
            profile
        )

        return Response(serializer.data)

    # -----------------------------------------------------
    # UPDATE PROFILE
    # -----------------------------------------------------

    serializer = UserProfileSerializer(
        profile,
        data=request.data,
        partial=True,
    )

    if serializer.is_valid():

        serializer.save()

        return Response(
            serializer.data
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST,
    )

# =========================================================
# USDA FOOD SEARCH
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def search_usda_foods(request):
    query = request.GET.get("q", "").strip()

    if not query:
        return Response(
            {"error": "Please provide a food search query."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not settings.USDA_API_KEY:
        return Response(
            {"error": "USDA API key is not configured."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    url = "https://api.nal.usda.gov/fdc/v1/foods/search"

    params = {
        "api_key": settings.USDA_API_KEY,
        "query": query,
        "pageSize": 25,
    }

    try:
        usda_response = requests.get(
            url,
            params=params,
            timeout=10,
        )

        usda_response.raise_for_status()
        data = usda_response.json()

    except requests.RequestException as error:
        print("USDA API error:", error)

        return Response(
            {"error": "Could not connect to USDA FoodData Central."},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    cleaned_foods = []

    for food in data.get("foods", []):
        fdc_id = food.get("fdcId")
        name = food.get("description", "Unknown Food")
        data_type = food.get("dataType", "")

        brand_name = (
            food.get("brandName")
            or food.get("brandOwner")
            or ""
        )

        # For now we normalize search results to 100 g.
        serving_size = 100
        serving_unit = "g"

        calories = 0
        protein = 0
        carbs = 0
        fat = 0

        nutrients = food.get("foodNutrients", [])

        for nutrient in nutrients:
            nutrient_number = str(
                nutrient.get("nutrientNumber", "")
            )

            unit_name = str(
                nutrient.get("unitName", "")
            ).upper()

            value = nutrient.get("value", 0) or 0

            # ENERGY
            # 2048 = Atwater Specific
            # 2047 = Atwater General
            # 208  = Energy
            if unit_name == "KCAL":
                if nutrient_number == "2048":
                    calories = value

                elif nutrient_number == "2047" and calories == 0:
                    calories = value

                elif nutrient_number == "208" and calories == 0:
                    calories = value

            # Protein
            if nutrient_number == "203":
                protein = value

            # Fat
            elif nutrient_number == "204":
                fat = value

            # Carbohydrates
            elif nutrient_number == "205":
                carbs = value

        cleaned_foods.append({
            "fdc_id": fdc_id,
            "name": name,
            "brand_name": brand_name,
            "data_type": data_type,
            "serving_size": serving_size,
            "serving_unit": serving_unit,
            "calories": round(float(calories), 1),
            "protein": round(float(protein), 1),
            "carbs": round(float(carbs), 1),
            "fat": round(float(fat), 1),
        })

    # =====================================================
    # RESULT RANKING
    # Generic foods first, branded foods later
    # =====================================================

    query_lower = query.lower()

    def food_priority(food):
        name_lower = food["name"].lower().strip()
        query_lower_clean = query_lower.strip()

        # Remove punctuation so:
        # "Apple, raw" -> ["apple", "raw"]
        # "Bananas, raw" -> ["bananas", "raw"]
        normalized_name = (
            name_lower
            .replace(",", " ")
            .replace("-", " ")
            .replace("(", " ")
            .replace(")", " ")
        )

        words = normalized_name.split()

        # -----------------------------------------------------
        # NAME RELEVANCE
        # -----------------------------------------------------

        # Exact name
        if name_lower == query_lower_clean:
            name_score = 0

        # First word is exactly the search:
        # apple -> "Apple, raw"
        elif words and words[0] == query_lower_clean:
            name_score = 1

        # Handle simple plural:
        # banana -> "Bananas, raw"
        elif (
            words
            and (
                words[0] == query_lower_clean + "s"
                or (
                    query_lower_clean.endswith("s")
                    and words[0] == query_lower_clean[:-1]
                )
            )
        ):
            name_score = 2

        # Search term appears as its own word
        elif query_lower_clean in words:
            name_score = 3

        # Name starts with search text
        elif name_lower.startswith(query_lower_clean):
            name_score = 4

        # Search appears somewhere else
        elif query_lower_clean in name_lower:
            name_score = 5

        else:
            name_score = 6

        # -----------------------------------------------------
        # FOOD TYPE
        # -----------------------------------------------------

        is_branded = food["data_type"] == "Branded"

        type_priority = {
            "Foundation": 0,
            "SR Legacy": 1,
            "Survey (FNDDS)": 2,
            "Branded": 3,
        }

        type_score = type_priority.get(
            food["data_type"],
            4,
        )

        # -----------------------------------------------------
        # BASIC FOOD BONUS
        # -----------------------------------------------------

        basic_words = [
            "raw",
            "fresh",
            "uncooked",
        ]

        is_basic = any(
            word in words
            for word in basic_words
        )

        # -----------------------------------------------------
        # COMBINED SCORE
        #
        # Lower = better.
        #
        # Name relevance remains important, but:
        # - common foods receive a bonus
        # - raw/basic foods receive another bonus
        # - branded foods receive a small penalty in All
        # -----------------------------------------------------

        score = name_score * 10

        if not is_branded:
            score -= 8

        if is_basic:
            score -= 6

        if is_branded:
            score += 5

        return (
            score,
            type_score,
            len(name_lower),
        )

        # -----------------------------------------------------
        # RAW / BASIC FOOD BONUS
        # -----------------------------------------------------

        basic_score = 1

        basic_words = [
            "raw",
            "fresh",
            "uncooked",
        ]

        if any(word in words for word in basic_words):
            basic_score = 0

        # -----------------------------------------------------
        # FINAL PRIORITY
        #
        # Name relevance FIRST.
        # Basic/raw food SECOND.
        # USDA data type THIRD.
        # -----------------------------------------------------

        return (
            type_score,
            name_score,
            basic_score,
            len(name_lower),
        )

    cleaned_foods.sort(key=food_priority)

    cleaned_foods = cleaned_foods[:15]

    return Response({
        "query": query,
        "count": len(cleaned_foods),
        "results": cleaned_foods,
    })

# =========================================================
# LOG USDA FOOD
#
# Creates/reuses a local Food, then creates a DiaryEntry.
# =========================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def log_usda_food(request):
    fdc_id = request.data.get("fdc_id")
    name = request.data.get("name", "").strip()

    serving_size = request.data.get("serving_size", 100)
    serving_unit = request.data.get("serving_unit", "g")

    calories = request.data.get("calories", 0)
    protein = request.data.get("protein", 0)
    carbs = request.data.get("carbs", 0)
    fat = request.data.get("fat", 0)

    meal = request.data.get("meal", "Breakfast")
    amount = request.data.get("amount", 100)
    date = request.data.get("date")

    if not fdc_id or not name:
        return Response(
            {"error": "USDA food information is missing."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # -----------------------------------------------------
    # FIND OR CREATE LOCAL FOOD
    # -----------------------------------------------------

    food = Food.objects.filter(
        name=name,
        serving_size=serving_size,
        serving_unit=serving_unit,
        calories=calories,
    ).first()

    if food is None:
        food = Food.objects.create(
            name=name,
            serving_size=serving_size,
            serving_unit=serving_unit,
            calories=calories,
            protein=protein,
            carbs=carbs,
            fat=fat,
        )

    # -----------------------------------------------------
    # CREATE DIARY ENTRY
    # -----------------------------------------------------

    diary_data = {
        "food": food.id,
        "meal": meal,
        "amount": amount,
    }

    if date:
        diary_data["date"] = date

    serializer = DiaryEntrySerializer(
        data=diary_data
    )

    if serializer.is_valid():
        serializer.save(
            user=request.user
        )

        return Response(
            {
                "food": FoodSerializer(food).data,
                "diary_entry": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST,
    )

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def custom_foods(request):
    # -----------------------------------------
    # GET - Return this user's custom foods
    # -----------------------------------------
    if request.method == "GET":
        foods = Food.objects.filter(
            user=request.user,
            is_custom=True,
            is_deleted=False,
        ).order_by("-id")

        serializer = FoodSerializer(
            foods,
            many=True,
        )

        return Response(serializer.data)

    # -----------------------------------------
    # POST - Create a new custom food
    # -----------------------------------------
    if request.method == "POST":
        name = request.data.get("name", "").strip()

        serving_size = request.data.get(
            "serving_size",
            100,
        )

        serving_unit = request.data.get(
            "serving_unit",
            "g",
        )

        calories = request.data.get("calories")
        protein = request.data.get("protein", 0)
        carbs = request.data.get("carbs", 0)
        fat = request.data.get("fat", 0)

        if not name:
            return Response(
                {"error": "Food name is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if calories is None:
            return Response(
                {"error": "Calories are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            serving_size = float(serving_size)
            calories = float(calories)
            protein = float(protein or 0)
            carbs = float(carbs or 0)
            fat = float(fat or 0)
        except (TypeError, ValueError):
            return Response(
                {
                    "error":
                    "Nutrition values must be valid numbers."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if serving_size <= 0:
            return Response(
                {
                    "error":
                    "Serving size must be greater than 0."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            calories < 0
            or protein < 0
            or carbs < 0
            or fat < 0
        ):
            return Response(
                {
                    "error":
                    "Nutrition values cannot be negative."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        food = Food.objects.create(
            user=request.user,
            is_custom=True,
            is_deleted=False,

            name=name,

            serving_size=serving_size,
            serving_unit=serving_unit,

            calories=calories,

            protein=protein,
            carbs=carbs,
            fat=fat,
        )

        serializer = FoodSerializer(food)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )



@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def custom_food_detail(request, food_id):
    try:
        food = Food.objects.get(
            id=food_id,
            user=request.user,
            is_custom=True,
            is_deleted=False,
        )
    except Food.DoesNotExist:
        return Response(
            {"error": "Custom food not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    # -----------------------------------------
    # GET - Get one custom food
    # -----------------------------------------
    if request.method == "GET":
        serializer = FoodSerializer(food)

        return Response(serializer.data)

    # -----------------------------------------
    # PATCH - Edit custom food
    # -----------------------------------------
    if request.method == "PATCH":
        name = request.data.get(
            "name",
            food.name,
        )

        serving_size = request.data.get(
            "serving_size",
            food.serving_size,
        )

        serving_unit = request.data.get(
            "serving_unit",
            food.serving_unit,
        )

        calories = request.data.get(
            "calories",
            food.calories,
        )

        protein = request.data.get(
            "protein",
            food.protein,
        )

        carbs = request.data.get(
            "carbs",
            food.carbs,
        )

        fat = request.data.get(
            "fat",
            food.fat,
        )

        name = str(name).strip()
        serving_unit = str(serving_unit).strip()

        if not name:
            return Response(
                {
                    "error":
                    "Food name is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            serving_size = float(
                serving_size,
            )

            calories = float(calories)
            protein = float(protein or 0)
            carbs = float(carbs or 0)
            fat = float(fat or 0)

        except (TypeError, ValueError):
            return Response(
                {
                    "error":
                    "Nutrition values must be valid numbers."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if serving_size <= 0:
            return Response(
                {
                    "error":
                    "Serving size must be greater than 0."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            calories < 0
            or protein < 0
            or carbs < 0
            or fat < 0
        ):
            return Response(
                {
                    "error":
                    "Nutrition values cannot be negative."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        food.name = name

        food.serving_size = serving_size
        food.serving_unit = (
            serving_unit or "g"
        )

        food.calories = calories

        food.protein = protein
        food.carbs = carbs
        food.fat = fat

        food.save()

        serializer = FoodSerializer(food)

        return Response(serializer.data)

    # -----------------------------------------
    # DELETE - Soft delete custom food
    # -----------------------------------------
    if request.method == "DELETE":
        food.is_deleted = True
        food.save(
            update_fields=["is_deleted"]
        )

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )