
#<p align="center">
  <img src="public/logo.png" alt="AI Mock Interviewer Logo" width="120" />
</p> AI Mock Interviewer

AI Mock Interviewer is a modern web application that allows recruiters and candidates to generate, schedule, and conduct AI-driven mock interviews. Built with React, Tailwind CSS, and Supabase for authentication and backend, it leverages AI to dynamically generate interview questions tailored to the job position and candidate experience.

---

## Features

- **AI-Powered Interview Generation**  
  Generate interview questions dynamically based on job description, position, and selected question types (Technical, Behavioral, Problem Solving, Situational).

- **Customizable Interview Types & Duration**  
  Select multiple question types and specify interview duration to automatically calculate the number of questions.

- **Dashboard & Navigation**  
  Intuitive dashboard to create, track, and manage interviews. Quick access to scheduled interviews, billing, and settings.

- **Responsive UI**  
  Sleek, dark-themed design built with Tailwind CSS that adapts to mobile and desktop.

- **User Authentication**  
  Secure login and session management powered by Supabase.

- **Question Management**  
  Filter questions by type, view full questions, and copy/send links to candidates.

---

## Tech Stack

- **Frontend:** React, Tailwind CSS, Framer Motion (animations), Lucide Icons  
- **Backend / Authentication:** Supabase (Postgres + Auth)  
- **AI Integration:** Groq API with LLaMA 3 for dynamic question generation  
- **Routing:** React Router v6  

---

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/<your-username>/ai-mock-interviewer.git
   cd ai-mock-interviewer

Install dependencies

npm install

Set up environment variables
Create a .env file in the root directory:

VITE_GROQ_API_KEY=your_groq_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

Run the development server

npm run dev

Open in browser
Navigate to http://localhost:5173

Project Structure
src/
├── components/
│   ├── ui/           # Reusable UI components (Button, Input, Select, etc.)
│   ├── Navbar.tsx
│   └── Sidebar.tsx
├── pages/
│   ├── Dashboard.tsx
│   ├── CreateInterview.tsx
│   └── InterviewQuestions.tsx
├── integrations/
│   └── supabase/
├── App.tsx
└── main.tsx
Usage

Sign Up / Login using your email.

Dashboard: View existing interviews or create new ones.

Create Interview:

Enter job position and description

Select interview duration and question types

Generate AI-powered interview questions

View Questions: Filter by type, expand to see full questions, copy or send links to candidates.

Contributing

Contributions are welcome!

Fork the repository

Create a new branch (git checkout -b feature/your-feature)

Commit your changes (git commit -m 'Add feature')

Push to the branch (git push origin feature/your-feature)

Open a Pull Request