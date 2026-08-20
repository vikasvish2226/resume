import type { AppState, Category, Food, Order, OrderItem, Owner, Rating, Restaurant } from "./types";

const KEY = "restaurant-qr-app-state-v1";

const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

const restaurantId = "restaurant_demo";
const ownerId = "owner_demo";

const seed: AppState = {
  currentOwnerId: ownerId,
  owners: [
    {
      id: ownerId,
      name: "Demo Owner",
      email: "owner@demo.com",
      phone: "+91 98765 43210",
      password: "password123",
      restaurantId,
    },
  ],
  restaurants: [
    {
      id: restaurantId,
      ownerId,
      name: "Masala Table",
      logo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=160&q=80",
      coverImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=85",
      address: "12 Market Road, Bengaluru",
      phone: "+91 98765 43210",
      email: "hello@masalatable.test",
      openingTime: "10:00",
      closingTime: "23:00",
      description: "Fresh Indian plates, tandoor snacks, biryani, desserts, and quick table service.",
      status: "open",
      createdAt: now(),
    },
  ],
  categories: [
    { id: "cat_starters", restaurantId, name: "Starters", sortOrder: 1, active: true },
    { id: "cat_mains", restaurantId, name: "Main Course", sortOrder: 2, active: true },
    { id: "cat_rice", restaurantId, name: "Rice", sortOrder: 3, active: true },
    { id: "cat_drinks", restaurantId, name: "Drinks", sortOrder: 4, active: true },
    { id: "cat_desserts", restaurantId, name: "Desserts", sortOrder: 5, active: true },
  ],
  foods: [
    {
      id: "food_paneer",
      restaurantId,
      categoryId: "cat_starters",
      name: "Paneer Tikka",
      price: 220,
      description: "Soft paneer marinated with ginger, chilli, yoghurt, and charred peppers.",
      imageUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=700&q=85",
      videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      preparationTime: 15,
      available: true,
      averageRating: 4.8,
      totalRatings: 128,
      createdAt: now(),
    },
    {
      id: "food_biryani",
      restaurantId,
      categoryId: "cat_rice",
      name: "Veg Biryani",
      price: 180,
      description: "Layered basmati rice with seasonal vegetables, saffron, and fried onions.",
      imageUrl: "https://images.unsplash.com/photo-1631515242808-497c3fbd3972?auto=format&fit=crop&w=700&q=85",
      videoUrl: "",
      preparationTime: 20,
      available: true,
      averageRating: 4.6,
      totalRatings: 94,
      createdAt: now(),
    },
    {
      id: "food_curry",
      restaurantId,
      categoryId: "cat_mains",
      name: "Chicken Curry",
      price: 260,
      description: "Slow cooked chicken in a rich tomato-onion gravy with warm spices.",
      imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=700&q=85",
      videoUrl: "",
      preparationTime: 22,
      available: true,
      averageRating: 4.7,
      totalRatings: 71,
      createdAt: now(),
    },
  ],
  orders: [],
  ratings: [],
};

export function loadState(): AppState {
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    localStorage.setItem(KEY, JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(raw) as AppState;
}

export function saveState(state: AppState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function createOwner(state: AppState, form: Record<string, string>): AppState {
  const owner: Owner = {
    id: id("owner"),
    name: form.ownerName,
    email: form.email.toLowerCase(),
    phone: form.mobile,
    password: form.password,
    restaurantId: id("restaurant"),
  };
  const restaurant: Restaurant = {
    id: owner.restaurantId,
    ownerId: owner.id,
    name: form.restaurantName,
    logo: "",
    coverImage: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1400&q=85",
    address: form.address,
    phone: form.mobile,
    email: form.email.toLowerCase(),
    openingTime: "10:00",
    closingTime: "22:00",
    description: "A fresh digital menu ready for your first dishes.",
    status: "open",
    createdAt: now(),
  };
  return { ...state, owners: [...state.owners, owner], restaurants: [...state.restaurants, restaurant], currentOwnerId: owner.id };
}

export function addCategory(state: AppState, restaurantIdValue: string, name: string): AppState {
  const next: Category = { id: id("cat"), restaurantId: restaurantIdValue, name, sortOrder: state.categories.length + 1, active: true };
  return { ...state, categories: [...state.categories, next] };
}

export function upsertFood(state: AppState, food: Partial<Food> & Pick<Food, "restaurantId" | "name" | "categoryId">): AppState {
  if (food.id) {
    return { ...state, foods: state.foods.map((item) => (item.id === food.id ? { ...item, ...food } as Food : item)) };
  }
  const next: Food = {
    id: id("food"),
    restaurantId: food.restaurantId,
    categoryId: food.categoryId,
    name: food.name,
    price: Number(food.price || 0),
    description: food.description || "",
    imageUrl: food.imageUrl || "",
    videoUrl: food.videoUrl || "",
    preparationTime: Number(food.preparationTime || 10),
    available: food.available ?? true,
    averageRating: 0,
    totalRatings: 0,
    createdAt: now(),
  };
  return { ...state, foods: [...state.foods, next] };
}

export function createOrder(state: AppState, restaurantIdValue: string, tableNumber: string, lines: { foodId: string; quantity: number }[], paymentMethod: Order["paymentMethod"]) {
  const foods = state.foods.filter((food) => lines.some((line) => line.foodId === food.id));
  const items: OrderItem[] = lines.map((line) => {
    const food = foods.find((item) => item.id === line.foodId)!;
    return { foodId: food.id, name: food.name, quantity: line.quantity, price: food.price };
  });
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const activeCount = state.orders.filter((order) => order.restaurantId === restaurantIdValue && order.orderStatus !== "COMPLETED").length;
  const order: Order = {
    id: id("order"),
    restaurantId: restaurantIdValue,
    tokenNumber: `A${104 + activeCount}`,
    tableNumber: tableNumber || "Takeaway",
    items,
    subtotal,
    totalAmount: subtotal,
    paymentMethod,
    paymentStatus: paymentMethod === "Cash" ? "PENDING" : "PENDING",
    orderStatus: "PLACED",
    customerSessionId: getCustomerSessionId(),
    createdAt: now(),
  };
  return { state: { ...state, orders: [order, ...state.orders] }, order };
}

export function addRatings(state: AppState, orderIdValue: string, values: Record<string, number>, review: string): AppState {
  const order = state.orders.find((item) => item.id === orderIdValue);
  if (!order || order.orderStatus !== "COMPLETED" || order.ratingSubmitted) return state;
  const created: Rating[] = order.items.map((item) => ({
    id: id("rating"),
    restaurantId: order.restaurantId,
    foodId: item.foodId,
    orderId: order.id,
    rating: values[item.foodId] || 5,
    review,
    createdAt: now(),
  }));
  const foods = state.foods.map((food) => {
    const matching = created.filter((rating) => rating.foodId === food.id);
    if (!matching.length) return food;
    const totalScore = food.averageRating * food.totalRatings + matching.reduce((sum, rating) => sum + rating.rating, 0);
    const totalRatings = food.totalRatings + matching.length;
    return { ...food, totalRatings, averageRating: Number((totalScore / totalRatings).toFixed(1)) };
  });
  return {
    ...state,
    foods,
    ratings: [...created, ...state.ratings],
    orders: state.orders.map((item) => (item.id === orderIdValue ? { ...item, ratingSubmitted: true } : item)),
  };
}

export function getCustomerSessionId() {
  const existing = localStorage.getItem("restaurant-qr-customer-session");
  if (existing) return existing;
  const next = id("session");
  localStorage.setItem("restaurant-qr-customer-session", next);
  return next;
}
