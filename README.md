# DeskFlow — Support Ticket Triage Board

**Student:** Abhishek Verma  
**Roll No:** 0827CI231005  
**Email:** abhishekverma230913@acropolis.in

---

## Project Structure

```
bajaj/
├── backend/        ← Express + MongoDB API
│   ├── controllers/
│   │   └── ticketController.js
│   ├── models/
│   │   └── Ticket.js
│   ├── routes/
│   │   └── ticketRoutes.js
│   ├── utils/
│   │   └── helpers.js
│   ├── .env
│   ├── server.js
│   └── package.json
│
└── frontend/       ← React app
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   ├── Board.jsx + Board.css
        │   ├── CreateTicketForm.jsx + CreateTicketForm.css
        │   ├── Filters.jsx + Filters.css
        │   ├── StatsStrip.jsx + StatsStrip.css
        │   └── TicketCard.jsx + TicketCard.css
        ├── api.js
        ├── App.jsx + App.css
        ├── index.js
        └── index.css
```

## Running Locally

### Backend
```bash
cd backend
npm install
# edit .env and add your MONGO_URI
npm run dev
```

### Frontend
```bash
cd frontend
npm install
# make sure .env has REACT_APP_API_URL=http://localhost:5000
npm start
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /tickets | Create a new ticket |
| GET | /tickets | List tickets (supports ?status, ?priority, ?breached=true) |
| PATCH | /tickets/:id | Update ticket status |
| DELETE | /tickets/:id | Delete a ticket |
| GET | /tickets/stats | Aggregate stats by status, priority, breached count |

## SLA Targets
- urgent: 1 hour
- high: 4 hours
- medium: 24 hours
- low: 72 hours

## Status Transitions
- open → in_progress
- in_progress → open (backwards)
- in_progress → resolved
- resolved → in_progress (backwards, clears resolvedAt)
- resolved → closed
