# 🧠 Intelligent Workflow Builder

## 📌 Overview
The **Intelligent Workflow Builder** is a low-code/no-code platform designed to visually create, configure, and execute AI-powered workflows. It enables users to design intelligent automation pipelines by dragging and dropping nodes such as **User Query**, **Knowledge Base**, **LLM Engine**, and **Output** on an interactive canvas.

This tool is ideal for:
- Building conversational AI workflows  
- Designing document processing pipelines  
- Automating tasks without heavy coding  

---

## 🚀 Features
- **Drag-and-Drop Workflow Canvas** using React Flow  
- **Configurable Nodes** for custom inputs and logic  
- **Integration with Large Language Models (LLMs)** for AI-powered automation  
- **Backend API** with FastAPI for workflow execution  
- **Persistent Storage** using PostgreSQL  
- **Real-Time Execution** and Output Visualization  

---

## 🛠 Tech Stack
- **Frontend:** React.js, React Flow, Tailwind CSS  
- **Backend:** FastAPI, Python  
- **Database:** PostgreSQL  
- **Other:** OpenAI API (or other LLMs), ChromaDB for vector storage  

---

## 📂 Project Structure


<img width="251" height="622" alt="image" src="https://github.com/user-attachments/assets/16f714dc-c38d-4f9f-ae7b-fa176392b883" />




---

## ⚡ Installation

### 1. Clone the Repository
```

git clone https://github.com/your-username/Intelligent-Workflow-Builder.git
cd Intelligent-Workflow-Builder
```

### 2. Frontend Setup

```
cd frontend
npm install
npm start
```


### 3.Backend Setup

```
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
