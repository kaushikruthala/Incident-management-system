# 🚨 Incident Management System (IMS)

![Status](https://img.shields.io/badge/status-active-success)
![Docker](https://img.shields.io/badge/docker-supported-blue)
![Kafka](https://img.shields.io/badge/kafka-event--driven-orange)
![Redis](https://img.shields.io/badge/redis-caching-red)
![PostgreSQL](https://img.shields.io/badge/postgresql-ACID-blue)
![MongoDB](https://img.shields.io/badge/mongodb-scalable-green)

A high-throughput, SRE-grade Incident Management System designed to process large-scale failure signals in real time.

---

## 📌 Overview

This system simulates a **production-ready incident pipeline** capable of:

* ⚡ Handling **10,000+ signals/sec**
* 🧠 Intelligent signal grouping (debouncing)
* 🔄 Event-driven processing
* 📊 Real-time monitoring dashboard
* 🔐 Enforced RCA workflow

---

# 🏗️ Architecture

## 🔷 System Architecture Diagram

👉 Open locally:

```text
IMS_Architecture_Diagram.html
```

> 💡 Tip: Open this file in your browser for an interactive view.

---

## 🔄 Data Flow

```text
Producers → Ingestion API → Rate Limiter → Ring Buffer
→ Redis Debounce → Kafka → Workflow Engine
→ PostgreSQL / MongoDB / Redis
→ Frontend Dashboard
```

---

## 🧱 Architecture Highlights

### 🚪 Ingestion Layer

* HTTP + gRPC endpoints
* Token Bucket rate limiting (10k/sec)
* Ring buffer for burst handling

---

### 🧠 Debounce Engine (Redis)

* Groups signals within time window
* Reduces alert noise

**Example:**

```text
100 signals → 1 incident
```

---

### 📩 Event Streaming (Kafka)

* `work-items` topic → incidents
* `raw-signals` topic → raw ingestion

---

### 🗄️ Storage Strategy

| System      | Purpose           |
| ----------- | ----------------- |
| PostgreSQL  | Source of truth   |
| MongoDB     | Raw signals       |
| Redis       | Cache + real-time |
| TimescaleDB | Metrics           |

---

### 🔄 Workflow Engine

State transitions:

```text
OPEN → INVESTIGATING → RESOLVED → CLOSED
```

✔ RCA required before closure
✔ MTTR automatically calculated

---

# 🖥️ Frontend Dashboard

* 📊 Live incident feed
* 🔍 Detailed incident view
* 📝 RCA submission form


---

# 🚀 Features

* ⚡ High throughput ingestion
* 🧵 Asynchronous processing
* 📦 Dual database architecture
* 📊 Real-time UI updates
* 🔐 Strong validation workflow
* 📈 Observability ready

---

# 🐳 Run Locally

## ▶️ Start all services

```bash
docker-compose up --build
```

---

## 📦 Services

* Backend API
* Frontend
* PostgreSQL
* MongoDB
* Redis
* Kafka
* TimescaleDB

---

# 📁 Project Structure

```text
.
├── backend/
├── frontend/
├── scripts/
├── docker-compose.yml
├── IMS_Architecture_Diagram.html
└── README.md
```

---

# ⚖️ Design Decisions

| Decision    | Reason                |
| ----------- | --------------------- |
| Kafka       | Decoupled processing  |
| Redis       | Fast cache + debounce |
| MongoDB     | High-volume storage   |
| PostgreSQL  | Data integrity        |
| Ring Buffer | Backpressure control  |

---

# 📡 Observability

* Health endpoint
* Throughput logging
* Metrics:

  * signals/sec
  * latency
  * system health

---

# 🧪 Testing / Simulation

```bash
python scripts/mock_generator.py
```

---

# 🎯 What This Shows

* Distributed system thinking
* SRE practices (MTTR, RCA, alerts)
* Event-driven architecture
* Scalability design

---

# 🚧 Future Improvements

* RBAC
* PagerDuty / Slack integration
* ML-based anomaly detection
* Multi-region failover

---

# 👨‍💻 Author

**Kaushik Ruthala**
https://github.com/kaushikruthala

---
