from django.urls import path
from . import views

urlpatterns = [
    path('test/', views.test_api),
    path('foods/', views.food_list),
    path("diary/", views.diary_list),
    path("diary/<int:entry_id>/",views.diary_detail),
    path("foods/recent/",views.recent_foods),
    path("water/",views.water_list),
    path("register/",views.register_user),
    path("login/",views.login_user),
    path("me/", views.current_user),
    path("profile/", views.user_profile),
    path("foods/search/", views.search_usda_foods),
    path("foods/usda/log/",views.log_usda_food,),
    path("foods/custom/",views.custom_foods,),
    path("foods/custom/<int:food_id>/",views.custom_food_detail,
),
]