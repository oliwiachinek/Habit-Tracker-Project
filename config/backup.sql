--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: habit_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.habit_entries (
    entry_id integer NOT NULL,
    habit_id integer,
    entry_date date NOT NULL,
    is_completed boolean DEFAULT false
);


ALTER TABLE public.habit_entries OWNER TO postgres;

--
-- Name: habit_entries_entry_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.habit_entries_entry_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.habit_entries_entry_id_seq OWNER TO postgres;

--
-- Name: habit_entries_entry_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.habit_entries_entry_id_seq OWNED BY public.habit_entries.entry_id;


--
-- Name: habit_streaks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.habit_streaks (
    streak_id integer NOT NULL,
    habit_id integer,
    start_date date NOT NULL,
    end_date date,
    current_streak integer DEFAULT 0,
    longest_streak integer DEFAULT 0
);


ALTER TABLE public.habit_streaks OWNER TO postgres;

--
-- Name: habit_streaks_streak_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.habit_streaks_streak_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.habit_streaks_streak_id_seq OWNER TO postgres;

--
-- Name: habit_streaks_streak_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.habit_streaks_streak_id_seq OWNED BY public.habit_streaks.streak_id;


--
-- Name: habits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.habits (
    habit_id integer NOT NULL,
    user_id integer,
    name character varying(100) NOT NULL,
    frequency character varying(10) NOT NULL,
    target_count integer,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT habits_frequency_check CHECK (((frequency)::text = ANY ((ARRAY['daily'::character varying, 'weekly'::character varying, 'monthly'::character varying, 'yearly'::character varying])::text[])))
);


ALTER TABLE public.habits OWNER TO postgres;

--
-- Name: habits_habit_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.habits_habit_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.habits_habit_id_seq OWNER TO postgres;

--
-- Name: habits_habit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.habits_habit_id_seq OWNED BY public.habits.habit_id;


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profiles (
    profile_id integer NOT NULL,
    user_id integer,
    full_name character varying(100),
    points integer DEFAULT 0
);


ALTER TABLE public.profiles OWNER TO postgres;

--
-- Name: profiles_profile_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.profiles_profile_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.profiles_profile_id_seq OWNER TO postgres;

--
-- Name: profiles_profile_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.profiles_profile_id_seq OWNED BY public.profiles.profile_id;


--
-- Name: rewards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rewards (
    reward_id integer NOT NULL,
    user_id integer,
    name character varying(100) NOT NULL,
    cost integer NOT NULL,
    claimed boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.rewards OWNER TO postgres;

--
-- Name: rewards_reward_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rewards_reward_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rewards_reward_id_seq OWNER TO postgres;

--
-- Name: rewards_reward_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rewards_reward_id_seq OWNED BY public.rewards.reward_id;


--
-- Name: special_tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.special_tasks (
    task_id integer NOT NULL,
    user_id integer,
    title character varying(100) NOT NULL,
    deadline date,
    status character varying(20) DEFAULT 'pending'::character varying,
    points_reward integer,
    CONSTRAINT special_tasks_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'completed'::character varying, 'failed'::character varying])::text[])))
);


ALTER TABLE public.special_tasks OWNER TO postgres;

--
-- Name: special_tasks_task_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.special_tasks_task_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.special_tasks_task_id_seq OWNER TO postgres;

--
-- Name: special_tasks_task_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.special_tasks_task_id_seq OWNED BY public.special_tasks.task_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: habit_entries entry_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.habit_entries ALTER COLUMN entry_id SET DEFAULT nextval('public.habit_entries_entry_id_seq'::regclass);


--
-- Name: habit_streaks streak_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.habit_streaks ALTER COLUMN streak_id SET DEFAULT nextval('public.habit_streaks_streak_id_seq'::regclass);


--
-- Name: habits habit_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.habits ALTER COLUMN habit_id SET DEFAULT nextval('public.habits_habit_id_seq'::regclass);


--
-- Name: profiles profile_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles ALTER COLUMN profile_id SET DEFAULT nextval('public.profiles_profile_id_seq'::regclass);


--
-- Name: rewards reward_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rewards ALTER COLUMN reward_id SET DEFAULT nextval('public.rewards_reward_id_seq'::regclass);


--
-- Name: special_tasks task_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.special_tasks ALTER COLUMN task_id SET DEFAULT nextval('public.special_tasks_task_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Data for Name: habit_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.habit_entries (entry_id, habit_id, entry_date, is_completed) FROM stdin;
\.


--
-- Data for Name: habit_streaks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.habit_streaks (streak_id, habit_id, start_date, end_date, current_streak, longest_streak) FROM stdin;
\.


--
-- Data for Name: habits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.habits (habit_id, user_id, name, frequency, target_count, created_at) FROM stdin;
1	4	Exercise	daily	5	2025-03-31 16:13:18.954265
2	4	Exercise	daily	5	2025-03-31 16:15:04.476771
3	4	Make bed	daily	7	2025-03-31 16:16:34.461954
4	4	Make bed	daily	7	2025-03-31 16:19:50.740274
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profiles (profile_id, user_id, full_name, points) FROM stdin;
\.


--
-- Data for Name: rewards; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rewards (reward_id, user_id, name, cost, claimed, created_at) FROM stdin;
\.


--
-- Data for Name: special_tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.special_tasks (task_id, user_id, title, deadline, status, points_reward) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, email, password_hash) FROM stdin;
1	test@example.com	$2a$10$TFV.VEreo5VxppnO.aL4Eeg.at0qmPbGQCN9H/jn0e.G0er0sHYzW
4	test2@example.com	$2a$10$qyUj8OR30PUM7/HFYIn2yuU6Exri6EntN0ucHivaexV9qhuwSZQxS
6	test3@example.com	$2a$10$nn8PMsngAYLjzL9GuB.BbOtqDlSK./50HVwBpQ3yLF4Xf38n2/KUG
\.


--
-- Name: habit_entries_entry_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.habit_entries_entry_id_seq', 1, false);


--
-- Name: habit_streaks_streak_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.habit_streaks_streak_id_seq', 1, false);


--
-- Name: habits_habit_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.habits_habit_id_seq', 4, true);


--
-- Name: profiles_profile_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.profiles_profile_id_seq', 1, false);


--
-- Name: rewards_reward_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rewards_reward_id_seq', 1, false);


--
-- Name: special_tasks_task_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.special_tasks_task_id_seq', 1, false);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 10, true);


--
-- Name: habit_entries habit_entries_habit_id_entry_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.habit_entries
    ADD CONSTRAINT habit_entries_habit_id_entry_date_key UNIQUE (habit_id, entry_date);


--
-- Name: habit_entries habit_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.habit_entries
    ADD CONSTRAINT habit_entries_pkey PRIMARY KEY (entry_id);


--
-- Name: habit_streaks habit_streaks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.habit_streaks
    ADD CONSTRAINT habit_streaks_pkey PRIMARY KEY (streak_id);


--
-- Name: habits habits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.habits
    ADD CONSTRAINT habits_pkey PRIMARY KEY (habit_id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (profile_id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: rewards rewards_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rewards
    ADD CONSTRAINT rewards_pkey PRIMARY KEY (reward_id);


--
-- Name: special_tasks special_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.special_tasks
    ADD CONSTRAINT special_tasks_pkey PRIMARY KEY (task_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: habit_entries habit_entries_habit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.habit_entries
    ADD CONSTRAINT habit_entries_habit_id_fkey FOREIGN KEY (habit_id) REFERENCES public.habits(habit_id) ON DELETE CASCADE;


--
-- Name: habit_streaks habit_streaks_habit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.habit_streaks
    ADD CONSTRAINT habit_streaks_habit_id_fkey FOREIGN KEY (habit_id) REFERENCES public.habits(habit_id) ON DELETE CASCADE;


--
-- Name: habits habits_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.habits
    ADD CONSTRAINT habits_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: rewards rewards_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rewards
    ADD CONSTRAINT rewards_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: special_tasks special_tasks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.special_tasks
    ADD CONSTRAINT special_tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

