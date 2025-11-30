--
-- PostgreSQL database dump
--

\restrict 5g45g4op9x1fNC27qmr6amdzcvLuXMFm0yxUXQAVRcsYHSTLHjyyKX0nw3xhp41

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

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

--
-- Name: audit_trigger_fn(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.audit_trigger_fn() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, changed_by, changed_at)
        VALUES (TG_TABLE_NAME, OLD.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), COALESCE(current_setting('app.current_user', true)::int, NULL), NOW());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, changed_by, changed_at)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), COALESCE(current_setting('app.current_user', true)::int, NULL), NOW());
        RETURN OLD;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_values, changed_by, changed_at)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), COALESCE(current_setting('app.current_user', true)::int, NULL), NOW());
        RETURN NEW;
    END IF;
END;
$$;


ALTER FUNCTION public.audit_trigger_fn() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: asset_assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_assignments (
    id integer NOT NULL,
    asset_id integer NOT NULL,
    user_id integer NOT NULL,
    assigned_date date NOT NULL,
    expected_return_date date,
    return_date date,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    created_by integer NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_by integer,
    CONSTRAINT asset_assignments_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'returned'::character varying])::text[])))
);


ALTER TABLE public.asset_assignments OWNER TO postgres;

--
-- Name: asset_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asset_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asset_assignments_id_seq OWNER TO postgres;

--
-- Name: asset_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_assignments_id_seq OWNED BY public.asset_assignments.id;


--
-- Name: asset_moves; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_moves (
    id integer NOT NULL,
    asset_id integer NOT NULL,
    from_location_id integer,
    to_location_id integer,
    moved_by integer,
    move_date date DEFAULT CURRENT_DATE NOT NULL,
    reason text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    created_by integer NOT NULL
);


ALTER TABLE public.asset_moves OWNER TO postgres;

--
-- Name: asset_moves_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asset_moves_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asset_moves_id_seq OWNER TO postgres;

--
-- Name: asset_moves_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_moves_id_seq OWNED BY public.asset_moves.id;


--
-- Name: assets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assets (
    id integer NOT NULL,
    category_id integer NOT NULL,
    location_id integer NOT NULL,
    supplier_id integer,
    asset_tag character varying(50) NOT NULL,
    serial_number character varying(100),
    name character varying(200) NOT NULL,
    brand character varying(100),
    model character varying(100),
    acquisition_date date NOT NULL,
    acquisition_value numeric(10,2) NOT NULL,
    useful_life_months integer DEFAULT 60 NOT NULL,
    residual_value numeric(10,2) DEFAULT 0 NOT NULL,
    status character varying(20) NOT NULL,
    condition character varying(20) NOT NULL,
    specs jsonb DEFAULT '{}'::jsonb,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    created_by integer NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_by integer,
    CONSTRAINT assets_acquisition_value_check CHECK ((acquisition_value >= (0)::numeric)),
    CONSTRAINT assets_condition_check CHECK (((condition)::text = ANY ((ARRAY['new'::character varying, 'good'::character varying, 'fair'::character varying, 'poor'::character varying, 'broken'::character varying])::text[]))),
    CONSTRAINT assets_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'stored'::character varying, 'disposed'::character varying, 'stolen'::character varying, 'under_repair'::character varying])::text[]))),
    CONSTRAINT assets_useful_life_months_check CHECK ((useful_life_months > 0))
);


ALTER TABLE public.assets OWNER TO postgres;

--
-- Name: assets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.assets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assets_id_seq OWNER TO postgres;

--
-- Name: assets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.assets_id_seq OWNED BY public.assets.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id bigint NOT NULL,
    table_name text NOT NULL,
    record_id integer NOT NULL,
    action text NOT NULL,
    old_values jsonb,
    new_values jsonb,
    changed_by integer,
    changed_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT audit_logs_action_check CHECK ((action = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    parent_id integer,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    created_by integer,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_by integer
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: locations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.locations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(20) NOT NULL,
    address character varying(255),
    city character varying(100) NOT NULL,
    country character varying(2) DEFAULT 'MX'::character varying NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    created_by integer,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_by integer
);


ALTER TABLE public.locations OWNER TO postgres;

--
-- Name: locations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.locations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.locations_id_seq OWNER TO postgres;

--
-- Name: locations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.locations_id_seq OWNED BY public.locations.id;


--
-- Name: maintenance_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_orders (
    id integer NOT NULL,
    asset_id integer NOT NULL,
    type character varying(20) NOT NULL,
    status character varying(20) DEFAULT 'scheduled'::character varying NOT NULL,
    planned_date date NOT NULL,
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    cost_parts numeric(10,2) DEFAULT 0 NOT NULL,
    cost_labor numeric(10,2) DEFAULT 0 NOT NULL,
    technician_id integer,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    created_by integer NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_by integer,
    CONSTRAINT maintenance_orders_cost_labor_check CHECK ((cost_labor >= (0)::numeric)),
    CONSTRAINT maintenance_orders_cost_parts_check CHECK ((cost_parts >= (0)::numeric)),
    CONSTRAINT maintenance_orders_status_check CHECK (((status)::text = ANY ((ARRAY['scheduled'::character varying, 'in_progress'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[]))),
    CONSTRAINT maintenance_orders_type_check CHECK (((type)::text = ANY ((ARRAY['preventive'::character varying, 'corrective'::character varying, 'upgrade'::character varying])::text[])))
);


ALTER TABLE public.maintenance_orders OWNER TO postgres;

--
-- Name: maintenance_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.maintenance_orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.maintenance_orders_id_seq OWNER TO postgres;

--
-- Name: maintenance_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.maintenance_orders_id_seq OWNED BY public.maintenance_orders.id;


--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suppliers (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    tax_id character varying(50),
    email character varying(150),
    phone character varying(20),
    contact_person character varying(100),
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    created_by integer,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_by integer
);


ALTER TABLE public.suppliers OWNER TO postgres;

--
-- Name: suppliers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.suppliers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.suppliers_id_seq OWNER TO postgres;

--
-- Name: suppliers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.suppliers_id_seq OWNED BY public.suppliers.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    full_name character varying(150) NOT NULL,
    email character varying(150) NOT NULL,
    employee_id character varying(50),
    department character varying(100) NOT NULL,
    job_title character varying(100) NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    created_by integer,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_by integer
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: asset_assignments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_assignments ALTER COLUMN id SET DEFAULT nextval('public.asset_assignments_id_seq'::regclass);


--
-- Name: asset_moves id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_moves ALTER COLUMN id SET DEFAULT nextval('public.asset_moves_id_seq'::regclass);


--
-- Name: assets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets ALTER COLUMN id SET DEFAULT nextval('public.assets_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: locations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations ALTER COLUMN id SET DEFAULT nextval('public.locations_id_seq'::regclass);


--
-- Name: maintenance_orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_orders ALTER COLUMN id SET DEFAULT nextval('public.maintenance_orders_id_seq'::regclass);


--
-- Name: suppliers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers ALTER COLUMN id SET DEFAULT nextval('public.suppliers_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: asset_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_assignments (id, asset_id, user_id, assigned_date, expected_return_date, return_date, status, notes, created_at, created_by, updated_at, updated_by) FROM stdin;
1	1	1	2025-01-15	2025-12-31	\N	active	\N	2025-11-28 12:15:08.805214	1	2025-11-28 12:15:08.805214	\N
2	2	2	2025-02-01	2025-11-30	\N	active	\N	2025-11-28 12:15:08.805214	1	2025-11-28 12:15:08.805214	\N
3	3	3	2025-03-01	2025-10-31	\N	active	\N	2025-11-28 12:15:08.805214	1	2025-11-28 12:15:08.805214	\N
4	4	4	2025-01-20	\N	\N	active	\N	2025-11-28 12:15:08.805214	1	2025-11-28 12:15:08.805214	\N
5	5	5	2025-02-15	\N	\N	active	\N	2025-11-28 12:15:08.805214	1	2025-11-28 12:15:08.805214	\N
6	6	1	2025-03-01	\N	\N	active	\N	2025-11-28 12:15:08.805214	1	2025-11-28 12:15:08.805214	\N
7	7	2	2025-03-10	\N	\N	active	\N	2025-11-28 12:15:08.805214	1	2025-11-28 12:15:08.805214	\N
\.


--
-- Data for Name: asset_moves; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_moves (id, asset_id, from_location_id, to_location_id, moved_by, move_date, reason, created_at, created_by) FROM stdin;
1	1	1	2	1	2025-04-01	Cambio de sucursal por proyecto	2025-11-28 12:15:24.662022	1
2	2	1	3	1	2025-05-10	Temporal almacén por reforma	2025-11-28 12:15:24.662022	1
3	3	2	1	1	2025-06-15	Retorno a oficina central	2025-11-28 12:15:24.662022	1
4	4	1	2	1	2025-07-01	Nueva área de diseño	2025-11-28 12:15:24.662022	1
5	5	1	2	1	2025-07-01	Acompaña a monitor 1	2025-11-28 12:15:24.662022	1
6	8	1	3	1	2025-08-01	Almacén por falta de espacio	2025-11-28 12:15:24.662022	1
7	10	1	2	1	2025-09-01	Mudanza a área de ventas	2025-11-28 12:15:24.662022	1
\.


--
-- Data for Name: assets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assets (id, category_id, location_id, supplier_id, asset_tag, serial_number, name, brand, model, acquisition_date, acquisition_value, useful_life_months, residual_value, status, condition, specs, notes, created_at, created_by, updated_at, updated_by) FROM stdin;
1	2	1	1	LAP-001	SN123456789	Laptop Dell Latitude 5420	Dell	Latitude 5420	2024-01-15	1200.00	60	0.00	active	good	{"cpu": "i5-1145G7", "ram": "16GB", "storage": "512GB SSD"}	\N	2025-11-28 12:14:44.699875	1	2025-11-28 12:14:44.699875	\N
2	2	1	1	LAP-002	SN987654321	Laptop HP ProBook 450	HP	ProBook 450	2024-02-10	1100.00	60	0.00	active	good	{"cpu": "i5-1135G7", "ram": "8GB", "storage": "256GB SSD"}	\N	2025-11-28 12:14:44.699875	1	2025-11-28 12:14:44.699875	\N
3	2	2	1	LAP-003	SN112233445	Laptop Lenovo ThinkPad E14	Lenovo	ThinkPad E14	2024-03-05	1050.00	60	0.00	active	fair	{"cpu": "Ryzen 5 5500U", "ram": "16GB", "storage": "512GB SSD"}	\N	2025-11-28 12:14:44.699875	1	2025-11-28 12:14:44.699875	\N
4	3	1	1	MON-001	SN554433221	Monitor Dell 24" Full HD	Dell	P2422H	2024-01-20	250.00	60	0.00	active	new	{"size": "24\\"", "resolution": "1920x1080"}	\N	2025-11-28 12:14:44.699875	1	2025-11-28 12:14:44.699875	\N
5	3	1	1	MON-002	SN665544332	Monitor HP 27" 4K	HP	Z27	2024-02-15	450.00	60	0.00	active	new	{"size": "27\\"", "resolution": "3840x2160"}	\N	2025-11-28 12:14:44.699875	1	2025-11-28 12:14:44.699875	\N
6	4	1	1	MOU-001	SN776655443	Mouse Logitech MX Master 3	Logitech	MX Master 3	2024-03-01	80.00	60	0.00	active	new	{"dpi": "4000", "type": "inalámbrico"}	\N	2025-11-28 12:14:44.699875	1	2025-11-28 12:14:44.699875	\N
7	4	1	1	TEC-001	SN887766554	Teclado Mecánico Keychron K2	Keychron	K2	2024-03-10	90.00	60	0.00	active	new	{"type": "mecánico", "layout": "ES"}	\N	2025-11-28 12:14:44.699875	1	2025-11-28 12:14:44.699875	\N
8	6	1	2	SIL-001	SN998877665	Silla Ergonómica Alta	ErgoSit	Pro-100	2024-01-25	300.00	60	0.00	active	good	{"color": "negro", "material": "malla"}	\N	2025-11-28 12:14:44.699875	1	2025-11-28 12:14:44.699875	\N
9	6	2	2	SIL-002	SN889977665	Silla Ejecutiva de Cuero	OfiLux	Lux-200	2024-02-20	450.00	60	0.00	active	new	{"color": "marrón", "material": "cuero"}	\N	2025-11-28 12:14:44.699875	1	2025-11-28 12:14:44.699875	\N
10	7	1	2	ESC-001	SN778899001	Escritorio Eléctrico 1.20m	SitStand	Elec-120	2024-03-15	550.00	60	0.00	active	new	{"width": "1.20m", "height": "ajustable"}	\N	2025-11-28 12:14:44.699875	1	2025-11-28 12:14:44.699875	\N
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, table_name, record_id, action, old_values, new_values, changed_by, changed_at) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, parent_id, active, created_at, created_by, updated_at, updated_by) FROM stdin;
1	Equipos de Cómputo	\N	t	2025-11-28 12:01:11.841467	1	2025-11-28 12:01:11.841467	\N
2	Laptops	1	t	2025-11-28 12:01:11.841467	1	2025-11-28 12:01:11.841467	\N
3	Monitores	1	t	2025-11-28 12:01:11.841467	1	2025-11-28 12:01:11.841467	\N
4	Periféricos	1	t	2025-11-28 12:01:11.841467	1	2025-11-28 12:01:11.841467	\N
5	Muebles de Oficina	\N	t	2025-11-28 12:01:11.841467	1	2025-11-28 12:01:11.841467	\N
6	Sillas	5	t	2025-11-28 12:01:11.841467	1	2025-11-28 12:01:11.841467	\N
7	Escritorios	5	t	2025-11-28 12:01:11.841467	1	2025-11-28 12:01:11.841467	\N
\.


--
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.locations (id, name, code, address, city, country, active, created_at, created_by, updated_at, updated_by) FROM stdin;
1	Oficina Central	OC01	Av. Principal 123	Ciudad de México	MX	t	2025-11-28 12:01:11.841467	1	2025-11-28 12:01:11.841467	\N
2	Sucursal Norte	SN01	Calle Norte 456	Monterrey	MX	t	2025-11-28 12:01:11.841467	1	2025-11-28 12:01:11.841467	\N
3	Almacén Central	AC01	Blvd. Logística 789	Guadalajara	MX	t	2025-11-28 12:01:11.841467	1	2025-11-28 12:01:11.841467	\N
\.


--
-- Data for Name: maintenance_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_orders (id, asset_id, type, status, planned_date, start_date, end_date, cost_parts, cost_labor, technician_id, notes, created_at, created_by, updated_at, updated_by) FROM stdin;
1	1	preventive	scheduled	2025-07-15	\N	\N	0.00	50.00	2	\N	2025-11-28 12:15:17.016237	1	2025-11-28 12:15:17.016237	\N
2	2	preventive	in_progress	2025-08-01	\N	\N	25.00	60.00	2	\N	2025-11-28 12:15:17.016237	1	2025-11-28 12:15:17.016237	\N
3	3	corrective	scheduled	2025-09-01	\N	\N	120.00	80.00	2	\N	2025-11-28 12:15:17.016237	1	2025-11-28 12:15:17.016237	\N
4	4	preventive	completed	2025-06-10	\N	\N	0.00	30.00	2	\N	2025-11-28 12:15:17.016237	1	2025-11-28 12:15:17.016237	\N
5	5	upgrade	scheduled	2025-10-01	\N	\N	200.00	100.00	2	\N	2025-11-28 12:15:17.016237	1	2025-11-28 12:15:17.016237	\N
6	9	preventive	scheduled	2025-08-20	\N	\N	0.00	40.00	2	\N	2025-11-28 12:15:17.016237	1	2025-11-28 12:15:17.016237	\N
7	10	preventive	scheduled	2025-09-05	\N	\N	0.00	60.00	2	\N	2025-11-28 12:15:17.016237	1	2025-11-28 12:15:17.016237	\N
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suppliers (id, name, tax_id, email, phone, contact_person, active, created_at, created_by, updated_at, updated_by) FROM stdin;
1	TecnoSoluciones S.A.	TSO123456	ventas@tecnosoluciones.com	\N	Jorge Pérez	t	2025-11-28 12:01:11.841467	1	2025-11-28 12:01:11.841467	\N
2	Muebles Modernos Ltda.	MML789012	contacto@mueblesmodernos.com	\N	Laura Soto	t	2025-11-28 12:01:11.841467	1	2025-11-28 12:01:11.841467	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, full_name, email, employee_id, department, job_title, active, created_at, created_by, updated_at, updated_by) FROM stdin;
1	Ana López	ana.lopez@empresa.com	EMP001	TI	Jefe de TI	t	2025-11-28 12:01:11.841467	1	2025-11-28 12:01:11.841467	\N
2	Carlos Ruiz	carlos.ruiz@empresa.com	EMP002	TI	Técnico	t	2025-11-28 12:01:11.841467	1	2025-11-28 12:01:11.841467	\N
3	María González	maria.gonzalez@empresa.com	EMP003	Recursos Humanos	Analista	t	2025-11-28 12:01:11.841467	1	2025-11-28 12:01:11.841467	\N
4	Luis Martínez	luis.martinez@empresa.com	EMP004	Contabilidad	Contador	t	2025-11-28 12:01:11.841467	1	2025-11-28 12:01:11.841467	\N
5	Sofía Herrera	sofia.herrera@empresa.com	EMP005	Compras	Comprador	t	2025-11-28 12:01:11.841467	1	2025-11-28 12:01:11.841467	\N
\.


--
-- Name: asset_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_assignments_id_seq', 7, true);


--
-- Name: asset_moves_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_moves_id_seq', 7, true);


--
-- Name: assets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assets_id_seq', 10, true);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 1, false);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 7, true);


--
-- Name: locations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.locations_id_seq', 3, true);


--
-- Name: maintenance_orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.maintenance_orders_id_seq', 7, true);


--
-- Name: suppliers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.suppliers_id_seq', 2, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 5, true);


--
-- Name: asset_assignments asset_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_assignments
    ADD CONSTRAINT asset_assignments_pkey PRIMARY KEY (id);


--
-- Name: asset_moves asset_moves_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_moves
    ADD CONSTRAINT asset_moves_pkey PRIMARY KEY (id);


--
-- Name: assets assets_asset_tag_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_asset_tag_key UNIQUE (asset_tag);


--
-- Name: assets assets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_pkey PRIMARY KEY (id);


--
-- Name: assets assets_serial_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_serial_number_key UNIQUE (serial_number);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: locations locations_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_code_key UNIQUE (code);


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- Name: maintenance_orders maintenance_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_orders
    ADD CONSTRAINT maintenance_orders_pkey PRIMARY KEY (id);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_employee_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_employee_id_key UNIQUE (employee_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_assets_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assets_category ON public.assets USING btree (category_id);


--
-- Name: idx_assets_location; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assets_location ON public.assets USING btree (location_id);


--
-- Name: idx_assets_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assets_status ON public.assets USING btree (status);


--
-- Name: idx_assignments_asset; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assignments_asset ON public.asset_assignments USING btree (asset_id);


--
-- Name: idx_assignments_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assignments_user ON public.asset_assignments USING btree (user_id);


--
-- Name: idx_audit_table_record; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_table_record ON public.audit_logs USING btree (table_name, record_id);


--
-- Name: idx_maintenance_asset; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_maintenance_asset ON public.maintenance_orders USING btree (asset_id);


--
-- Name: idx_maintenance_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_maintenance_status ON public.maintenance_orders USING btree (status);


--
-- Name: idx_moves_asset; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_moves_asset ON public.asset_moves USING btree (asset_id);


--
-- Name: assets trg_audit_assets; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_audit_assets AFTER INSERT OR DELETE OR UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();


--
-- Name: asset_assignments trg_audit_assignments; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_audit_assignments AFTER INSERT OR DELETE OR UPDATE ON public.asset_assignments FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();


--
-- Name: categories trg_audit_categories; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_audit_categories AFTER INSERT OR DELETE OR UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();


--
-- Name: locations trg_audit_locations; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_audit_locations AFTER INSERT OR DELETE OR UPDATE ON public.locations FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();


--
-- Name: maintenance_orders trg_audit_maintenance; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_audit_maintenance AFTER INSERT OR DELETE OR UPDATE ON public.maintenance_orders FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();


--
-- Name: asset_moves trg_audit_moves; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_audit_moves AFTER INSERT OR DELETE OR UPDATE ON public.asset_moves FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();


--
-- Name: suppliers trg_audit_suppliers; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_audit_suppliers AFTER INSERT OR DELETE OR UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();


--
-- Name: users trg_audit_users; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_audit_users AFTER INSERT OR DELETE OR UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();


--
-- Name: asset_assignments asset_assignments_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_assignments
    ADD CONSTRAINT asset_assignments_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id);


--
-- Name: asset_assignments asset_assignments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_assignments
    ADD CONSTRAINT asset_assignments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: asset_assignments asset_assignments_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_assignments
    ADD CONSTRAINT asset_assignments_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: asset_assignments asset_assignments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_assignments
    ADD CONSTRAINT asset_assignments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: asset_moves asset_moves_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_moves
    ADD CONSTRAINT asset_moves_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id);


--
-- Name: asset_moves asset_moves_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_moves
    ADD CONSTRAINT asset_moves_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: asset_moves asset_moves_from_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_moves
    ADD CONSTRAINT asset_moves_from_location_id_fkey FOREIGN KEY (from_location_id) REFERENCES public.locations(id);


--
-- Name: asset_moves asset_moves_moved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_moves
    ADD CONSTRAINT asset_moves_moved_by_fkey FOREIGN KEY (moved_by) REFERENCES public.users(id);


--
-- Name: asset_moves asset_moves_to_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_moves
    ADD CONSTRAINT asset_moves_to_location_id_fkey FOREIGN KEY (to_location_id) REFERENCES public.locations(id);


--
-- Name: assets assets_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: assets assets_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: assets assets_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id);


--
-- Name: assets assets_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- Name: assets assets_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: audit_logs audit_logs_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id);


--
-- Name: categories categories_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id);


--
-- Name: categories categories_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: locations locations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: locations locations_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: maintenance_orders maintenance_orders_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_orders
    ADD CONSTRAINT maintenance_orders_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id);


--
-- Name: maintenance_orders maintenance_orders_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_orders
    ADD CONSTRAINT maintenance_orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: maintenance_orders maintenance_orders_technician_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_orders
    ADD CONSTRAINT maintenance_orders_technician_id_fkey FOREIGN KEY (technician_id) REFERENCES public.users(id);


--
-- Name: maintenance_orders maintenance_orders_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_orders
    ADD CONSTRAINT maintenance_orders_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: suppliers suppliers_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: suppliers suppliers_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: users users_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: users users_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict 5g45g4op9x1fNC27qmr6amdzcvLuXMFm0yxUXQAVRcsYHSTLHjyyKX0nw3xhp41

