# 🔴 DAY ENGINE API - Complete Reference

Base URL: `https://blueriot-matrikh-nodks.onrender.com/api/days`

All endpoints return JSON responses with `success: true` on success.

---

## 📋 Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tour/:tourId` | Get all days for a tour |
| GET | `/:id` | Get single day by ID |
| GET | `/:id?withLinked=true` | Get day with linked items |
| POST | `/` | Create new day |
| PUT | `/:id` | Update day |
| DELETE | `/:id` | Delete day (auto-renumbers) |
| POST | `/reorder` | Reorder days (drag & drop) |
| POST | `/swap` | Swap two days |
| POST | `/:id/assign` | Assign items to day |

---

## 1️⃣ Get All Days for Tour

**GET** `/tour/:tourId`

Returns all days for a tour, ordered by `logical_day_number`.

### Request
```bash
GET /api/days/tour/123e4567-e89b-12d3-a456-426614174000
```

### Response
```json
{
  "success": true,
  "tourId": "123e4567-e89b-12d3-a456-426614174000",
  "count": 7,
  "days": [
    {
      "id": "day-uuid-1",
      "tour_id": "123e4567-e89b-12d3-a456-426614174000",
      "calendar_date": "2025-06-15",
      "logical_day_number": 1,
      "day_title": "Arrival in Rome",
      "cities": ["Rome"],
      "primary_city": "Rome",
      "morning_schedule": "Arrival at Fiumicino Airport",
      "afternoon_schedule": "Check-in at hotel",
      "evening_schedule": "Welcome dinner",
      "is_hiking_day": false,
      "hotel_id": "hotel-uuid-1",
      "tastes_ids": ["restaurant-uuid-1"],
      "routes_ids": ["route-uuid-1"],
      "ticket_ids": [],
      "created_at": "2025-11-30T20:00:00Z",
      "updated_at": "2025-11-30T20:00:00Z"
    },
    // ... more days
  ]
}
```

---

## 2️⃣ Get Single Day

**GET** `/:id`

Get a single day by ID. Add `?withLinked=true` to include linked items.

### Basic Request
```bash
GET /api/days/day-uuid-1
```

### Response
```json
{
  "success": true,
  "day": {
    "id": "day-uuid-1",
    "tour_id": "tour-uuid",
    "calendar_date": "2025-06-15",
    "logical_day_number": 1,
    "day_title": "Arrival in Rome",
    // ... all day fields
  }
}
```

### With Linked Items
```bash
GET /api/days/day-uuid-1?withLinked=true
```

### Response (with linked items)
```json
{
  "success": true,
  "day": {
    "id": "day-uuid-1",
    // ... all day fields
    "linked_tastes": [
      {
        "id": "restaurant-uuid-1",
        "name": "Trattoria da Mario",
        "cuisine_type": "Italian",
        "city": "Rome"
      }
    ],
    "linked_routes": [
      {
        "id": "route-uuid-1",
        "route_type": "transfer",
        "from_location": "Fiumicino Airport",
        "to_location": "Hotel"
      }
    ],
    "linked_hotel": {
      "id": "hotel-uuid-1",
      "name": "Hotel Roma",
      "city": "Rome",
      "address": "Via del Corso 123"
    },
    "linked_tickets": []
  }
}
```

---

## 3️⃣ Create New Day

**POST** `/`

Creates a new day with auto-incremented `logical_day_number`.

### Request Body
```json
{
  "tour_id": "123e4567-e89b-12d3-a456-426614174000",
  "calendar_date": "2025-06-16",
  "day_title": "Exploring Rome",
  "cities": ["Rome"],
  "primary_city": "Rome",
  "morning_schedule": "Vatican Museums",
  "afternoon_schedule": "Colosseum visit",
  "evening_schedule": "Trastevere dinner",
  "is_hiking_day": false,
  "hotel_id": "hotel-uuid-1",
  "tastes_ids": ["restaurant-uuid-2"],
  "routes_ids": [],
  "ticket_ids": ["ticket-uuid-1"]
}
```

**Required fields**: `tour_id`, `calendar_date`

### Response
```json
{
  "success": true,
  "day": {
    "id": "new-day-uuid",
    "tour_id": "123e4567-e89b-12d3-a456-426614174000",
    "calendar_date": "2025-06-16",
    "logical_day_number": 8,  // Auto-assigned
    "day_title": "Exploring Rome",
    // ... all fields
  }
}
```

---

## 4️⃣ Update Day

**PUT** `/:id`

Update any day fields. Only provided fields are updated.

### Request Body
```json
{
  "day_title": "Rome - Ancient Wonders",
  "morning_schedule": "Colosseum guided tour at 9:00 AM",
  "is_hiking_day": false,
  "tastes_ids": ["restaurant-uuid-2", "restaurant-uuid-3"]
}
```

### Response
```json
{
  "success": true,
  "day": {
    "id": "day-uuid-1",
    // ... updated fields
    "updated_at": "2025-11-30T21:00:00Z"
  }
}
```

---

## 5️⃣ Delete Day

**DELETE** `/:id`

Deletes a day and **auto-renumbers** remaining days.

Example: If you delete Day 3 out of 7 days, Days 4-7 become Days 3-6.

### Request
```bash
DELETE /api/days/day-uuid-3
```

### Response
```json
{
  "success": true,
  "message": "Day deleted and remaining days renumbered"
}
```

---

## 6️⃣ Reorder Days (Drag & Drop)

**POST** `/reorder`

Reorder days via drag & drop. Updates `logical_day_number` without changing `calendar_date`.

### Request Body
```json
{
  "tourId": "123e4567-e89b-12d3-a456-426614174000",
  "dayOrder": [
    { "id": "day-uuid-2", "new_logical_day_number": 1 },
    { "id": "day-uuid-1", "new_logical_day_number": 2 },
    { "id": "day-uuid-3", "new_logical_day_number": 3 }
  ]
}
```

### Response
```json
{
  "success": true,
  "tourId": "123e4567-e89b-12d3-a456-426614174000",
  "days": [
    // All days in new order
  ]
}
```

---

## 7️⃣ Swap Two Days

**POST** `/swap`

Quickly swap the positions of two days.

### Request Body
```json
{
  "day1Id": "day-uuid-1",
  "day2Id": "day-uuid-5"
}
```

### Response
```json
{
  "success": true,
  "swapped": [
    { "id": "day-uuid-1", "new_logical_day": 5 },
    { "id": "day-uuid-5", "new_logical_day": 1 }
  ]
}
```

---

## 8️⃣ Assign Items to Day

**POST** `/:id/assign`

Assign restaurants, routes, hotels, or tickets to a day.

### Request Body
```json
{
  "tastes_ids": ["restaurant-uuid-1", "restaurant-uuid-2"],
  "routes_ids": ["route-uuid-1"],
  "hotel_id": "hotel-uuid-3",
  "ticket_ids": ["ticket-uuid-1", "ticket-uuid-2"]
}
```

### Response
```json
{
  "success": true,
  "day": {
    "id": "day-uuid-1",
    // ... day with updated assignments
  }
}
```

---

## 🎯 Frontend Integration Examples

### React/JavaScript Example

```javascript
const API_BASE = 'https://blueriot-matrikh-nodks.onrender.com/api/days';

// Get all days for a tour
async function getTourDays(tourId) {
  const response = await fetch(`${API_BASE}/tour/${tourId}`);
  const data = await response.json();
  return data.days;
}

// Create new day
async function createDay(dayData) {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dayData)
  });
  return await response.json();
}

// Reorder days (after drag & drop)
async function reorderDays(tourId, newOrder) {
  const dayOrder = newOrder.map((day, index) => ({
    id: day.id,
    new_logical_day_number: index + 1
  }));

  const response = await fetch(`${API_BASE}/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tourId, dayOrder })
  });
  return await response.json();
}

// Update day
async function updateDay(dayId, updates) {
  const response = await fetch(`${API_BASE}/${dayId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  return await response.json();
}

// Delete day
async function deleteDay(dayId) {
  const response = await fetch(`${API_BASE}/${dayId}`, {
    method: 'DELETE'
  });
  return await response.json();
}
```

### Axios Example

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://blueriot-matrikh-nodks.onrender.com/api/days'
});

// Get days with linked items
const getDayWithDetails = async (dayId) => {
  const { data } = await api.get(`/${dayId}?withLinked=true`);
  return data.day;
};

// Swap days
const swapDays = async (day1Id, day2Id) => {
  const { data } = await api.post('/swap', { day1Id, day2Id });
  return data;
};

// Assign restaurant to day
const assignRestaurantToDay = async (dayId, restaurantId) => {
  const { data } = await api.post(`/${dayId}/assign`, {
    tastes_ids: [restaurantId]
  });
  return data.day;
};
```

---

## 🚀 Status

**✅ DEPLOYED**: All endpoints are live at Render

**🔗 Base URL**: https://blueriot-matrikh-nodks.onrender.com

**🧪 Test Health**: `GET /health`

**📊 Next Step**: Build the UI for drag & drop day management

---

## 📝 Notes

1. **Dual Numbering System**:
   - `calendar_date`: Fixed calendar date (doesn't change)
   - `logical_day_number`: Reorderable position (for drag & drop)

2. **Auto-Renumbering**: When you delete a day, all subsequent days are automatically renumbered.

3. **Linked Items**: Days can reference:
   - `tastes_ids` → Restaurants (blueriot_tastes)
   - `routes_ids` → Transport (blueriot_routes)
   - `hotel_id` → Hotel (blueriot_stay)
   - `ticket_ids` → Tickets (tickets table)

4. **CORS**: Frontend at `https://blueriot723.github.io` is whitelisted.

---

✅ **DAY ENGINE API - COMPLETE**
