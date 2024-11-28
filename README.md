# FoodDeliveryAPI

The FoodDeliveryAPI is a RESTful API designed to manage and facilitate food delivery services. It allows users to browse menus, place orders, and track deliveries.

#### Authentication Endpoints

-   **POST /auth/register**: Register a new user.

-   **POST /auth/login-admin**
    : Admin login.

-   **POST /auth/login-user**
    : User login.

-   **POST /auth/login-delivery-man**: Delivery Man login.

#### Food Endpoints

-   **GET /foods**
    : List all food items. (Admin only)

-   **POST /foods**
    : Add a new food item. (Admin only)

-   **PUT /foods/:id**
    : Update a food item by ID. (Admin only)

-   **DELETE /foods/:id**: Delete a food item by ID. (Admin only)

#### Order Endpoints

-   **POST /orders**
    : Place a new order. (User only)

-   **GET /orders**
    : View all orders. (Admin only)

-   **GET /orders/:id**
    : View order details by ID. (User or Admin)

-   **PUT /orders/:id/status**
    : Update order status by ID. (Admin only)

-   **GET /orders/assigned**
    : View orders assigned to a delivery man.

-   **PUT /orders/:id/delivered**: Delivery Man marks an order as delivered.

#### Log Endpoints

-   **GET /logs**: View transaction logs. (Admin only)
