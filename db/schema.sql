--
-- PostgreSQL database dump
--

\restrict U5mcX9C5zMu740s8sfuxOzbbLSEzz76aNYrmswYEl43Cd555i3wdblLmyafboYI

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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
-- Name: ai_insights; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_insights (
    id character varying(20) NOT NULL,
    category character varying(100) NOT NULL,
    severity character varying(20) NOT NULL,
    headline text NOT NULL,
    detail text NOT NULL,
    recommendation text NOT NULL,
    insight_timestamp timestamp without time zone NOT NULL,
    affected_area character varying(255) NOT NULL
);


--
-- Name: applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.applications (
    app_id character varying(15) NOT NULL,
    name character varying(255) NOT NULL,
    owner character varying(100) NOT NULL,
    status character varying(20) NOT NULL,
    availability real NOT NULL,
    open_incidents integer NOT NULL,
    version character varying(20) NOT NULL,
    last_deployment character varying(10) NOT NULL,
    sla_target real NOT NULL,
    sla_actual real NOT NULL,
    environment character varying(10) NOT NULL,
    tier character varying(30) NOT NULL
);


--
-- Name: batch_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.batch_jobs (
    job_id character varying(10) NOT NULL,
    job_name text NOT NULL,
    application character varying(255) NOT NULL,
    status character varying(15) NOT NULL,
    scheduled_time character varying(10) NOT NULL,
    start_time character varying(10) NOT NULL,
    end_time character varying(10),
    duration integer,
    records_processed integer NOT NULL
);


--
-- Name: capability_ai_certs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.capability_ai_certs (
    id integer NOT NULL,
    label character varying(200) NOT NULL,
    current_count integer DEFAULT 0 NOT NULL,
    planned_count integer DEFAULT 0 NOT NULL,
    use_case text DEFAULT ''::text NOT NULL,
    display_order integer DEFAULT 0 NOT NULL
);


--
-- Name: capability_ai_certs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.capability_ai_certs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: capability_ai_certs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.capability_ai_certs_id_seq OWNED BY public.capability_ai_certs.id;


--
-- Name: capability_areas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.capability_areas (
    id integer NOT NULL,
    area character varying(200) NOT NULL,
    sub text DEFAULT ''::text NOT NULL,
    current_count integer DEFAULT 0 NOT NULL,
    planned_count integer DEFAULT 0 NOT NULL,
    priority character varying(20) DEFAULT 'Medium'::character varying NOT NULL,
    impact text DEFAULT ''::text NOT NULL,
    display_order integer DEFAULT 0 NOT NULL
);


--
-- Name: capability_areas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.capability_areas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: capability_areas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.capability_areas_id_seq OWNED BY public.capability_areas.id;


--
-- Name: capability_governance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.capability_governance (
    id integer NOT NULL,
    practice character varying(200) NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    cadence character varying(50) DEFAULT ''::character varying NOT NULL,
    owner character varying(100) DEFAULT ''::character varying NOT NULL,
    status character varying(30) DEFAULT 'active'::character varying NOT NULL
);


--
-- Name: capability_governance_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.capability_governance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: capability_governance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.capability_governance_id_seq OWNED BY public.capability_governance.id;


--
-- Name: capability_kpis; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.capability_kpis (
    id integer NOT NULL,
    kpi_key character varying(80) NOT NULL,
    label character varying(200) NOT NULL,
    value real DEFAULT 0 NOT NULL,
    formatted character varying(100) NOT NULL,
    change real DEFAULT 0 NOT NULL,
    status character varying(10) DEFAULT 'green'::character varying NOT NULL,
    trend character varying(10) DEFAULT 'flat'::character varying NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    sub text DEFAULT ''::text NOT NULL,
    icon_key character varying(40) DEFAULT 'award'::character varying NOT NULL,
    color_key character varying(40) DEFAULT 'blue'::character varying NOT NULL,
    delta text DEFAULT ''::text NOT NULL
);


--
-- Name: capability_kpis_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.capability_kpis_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: capability_kpis_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.capability_kpis_id_seq OWNED BY public.capability_kpis.id;


--
-- Name: capability_radar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.capability_radar (
    id integer NOT NULL,
    axis character varying(80) NOT NULL,
    current real DEFAULT 0 NOT NULL,
    planned real DEFAULT 0 NOT NULL,
    display_order integer DEFAULT 0 NOT NULL
);


--
-- Name: capability_radar_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.capability_radar_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: capability_radar_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.capability_radar_id_seq OWNED BY public.capability_radar.id;


--
-- Name: capability_stages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.capability_stages (
    id integer NOT NULL,
    stage character varying(50) NOT NULL,
    title character varying(200) NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    current_maturity real DEFAULT 0 NOT NULL,
    target_maturity real DEFAULT 0 NOT NULL,
    status character varying(30) DEFAULT 'planned'::character varying NOT NULL,
    owner_team character varying(100) DEFAULT ''::character varying NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    "position" integer DEFAULT 0 NOT NULL
);


--
-- Name: capability_stages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.capability_stages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: capability_stages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.capability_stages_id_seq OWNED BY public.capability_stages.id;


--
-- Name: capability_training; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.capability_training (
    id integer NOT NULL,
    program_name character varying(200) NOT NULL,
    category character varying(80) DEFAULT ''::character varying NOT NULL,
    audience character varying(200) DEFAULT ''::character varying NOT NULL,
    start_date character varying(10) DEFAULT ''::character varying NOT NULL,
    end_date character varying(10) DEFAULT ''::character varying NOT NULL,
    enrollment integer DEFAULT 0 NOT NULL,
    completion_rate real DEFAULT 0 NOT NULL,
    status character varying(30) DEFAULT 'planned'::character varying NOT NULL,
    vendor character varying(80) DEFAULT ''::character varying NOT NULL,
    track character varying(100) DEFAULT ''::character varying NOT NULL,
    format character varying(30) DEFAULT 'Virtual'::character varying NOT NULL,
    level character varying(30) DEFAULT 'Essentials'::character varying NOT NULL,
    seats integer DEFAULT 0 NOT NULL,
    color character varying(20) DEFAULT '#0f62fe'::character varying NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    certification_earned text DEFAULT ''::text NOT NULL
);


--
-- Name: capability_training_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.capability_training_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: capability_training_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.capability_training_id_seq OWNED BY public.capability_training.id;


--
-- Name: capability_value_impact; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.capability_value_impact (
    id integer NOT NULL,
    cap character varying(100) NOT NULL,
    metric text DEFAULT ''::text NOT NULL,
    value character varying(40) DEFAULT ''::character varying NOT NULL,
    color_key character varying(40) DEFAULT 'blue'::character varying NOT NULL,
    display_order integer DEFAULT 0 NOT NULL
);


--
-- Name: capability_value_impact_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.capability_value_impact_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: capability_value_impact_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.capability_value_impact_id_seq OWNED BY public.capability_value_impact.id;


--
-- Name: capability_workforce_transformation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.capability_workforce_transformation (
    id integer NOT NULL,
    side character varying(20) NOT NULL,
    bullet text NOT NULL,
    display_order integer DEFAULT 0 NOT NULL
);


--
-- Name: capability_workforce_transformation_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.capability_workforce_transformation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: capability_workforce_transformation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.capability_workforce_transformation_id_seq OWNED BY public.capability_workforce_transformation.id;


--
-- Name: claims; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.claims (
    claim_id character varying(20) NOT NULL,
    member_id character varying(20) NOT NULL,
    member_name character varying(100) NOT NULL,
    provider character varying(255) NOT NULL,
    service_date character varying(10) NOT NULL,
    received_date character varying(10) NOT NULL,
    status character varying(30) NOT NULL,
    amount integer NOT NULL,
    line_of_business character varying(50) NOT NULL,
    age_days integer NOT NULL,
    denial_reason character varying(100)
);


--
-- Name: claims_aging; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.claims_aging (
    id integer NOT NULL,
    bucket character varying(30) NOT NULL,
    count integer NOT NULL,
    percentage real NOT NULL,
    severity character varying(10) NOT NULL
);


--
-- Name: claims_aging_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.claims_aging_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: claims_aging_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.claims_aging_id_seq OWNED BY public.claims_aging.id;


--
-- Name: claims_denial_reasons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.claims_denial_reasons (
    id integer NOT NULL,
    reason text NOT NULL,
    count integer NOT NULL,
    percentage real NOT NULL,
    trend character varying(10) NOT NULL
);


--
-- Name: claims_denial_reasons_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.claims_denial_reasons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: claims_denial_reasons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.claims_denial_reasons_id_seq OWNED BY public.claims_denial_reasons.id;


--
-- Name: claims_lob_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.claims_lob_stats (
    id integer NOT NULL,
    lob character varying(50) NOT NULL,
    received integer NOT NULL,
    processed integer NOT NULL,
    pending integer NOT NULL,
    amount integer NOT NULL
);


--
-- Name: claims_lob_stats_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.claims_lob_stats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: claims_lob_stats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.claims_lob_stats_id_seq OWNED BY public.claims_lob_stats.id;


--
-- Name: contactcenter_call_reasons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contactcenter_call_reasons (
    id integer NOT NULL,
    reason text NOT NULL,
    count integer NOT NULL,
    percentage real NOT NULL,
    trend character varying(10) NOT NULL
);


--
-- Name: contactcenter_call_reasons_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.contactcenter_call_reasons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: contactcenter_call_reasons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.contactcenter_call_reasons_id_seq OWNED BY public.contactcenter_call_reasons.id;


--
-- Name: contactcenter_hourly; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contactcenter_hourly (
    id integer NOT NULL,
    hour_label character varying(20) NOT NULL,
    calls integer NOT NULL,
    chats integer NOT NULL,
    emails integer NOT NULL
);


--
-- Name: contactcenter_hourly_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.contactcenter_hourly_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: contactcenter_hourly_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.contactcenter_hourly_id_seq OWNED BY public.contactcenter_hourly.id;


--
-- Name: daily_trends; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_trends (
    id text NOT NULL,
    trend_date character varying(10) NOT NULL,
    claims integer NOT NULL,
    enrollments integer NOT NULL,
    prior_auths integer NOT NULL,
    availability real NOT NULL,
    incidents integer NOT NULL
);


--
-- Name: executive_alerts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.executive_alerts (
    id character varying(20) NOT NULL,
    severity character varying(20) NOT NULL,
    category character varying(100) NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    status character varying(30) NOT NULL,
    alert_timestamp timestamp without time zone NOT NULL,
    impacted_system character varying(255) NOT NULL,
    drill_down_path character varying(255) NOT NULL
);


--
-- Name: ibmams_runbooks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ibmams_runbooks (
    runbook_id character varying(10) NOT NULL,
    name text NOT NULL,
    category character varying(50) NOT NULL,
    executions_today integer NOT NULL,
    success_rate real NOT NULL,
    time_saved_hours real NOT NULL
);


--
-- Name: ibmams_savings_trend; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ibmams_savings_trend (
    id integer NOT NULL,
    month_label character varying(15) NOT NULL,
    savings integer NOT NULL,
    avoidance integer NOT NULL
);


--
-- Name: ibmams_savings_trend_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ibmams_savings_trend_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ibmams_savings_trend_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ibmams_savings_trend_id_seq OWNED BY public.ibmams_savings_trend.id;


--
-- Name: ibmams_ticket_trends; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ibmams_ticket_trends (
    id integer NOT NULL,
    week_label character varying(20) NOT NULL,
    total integer NOT NULL,
    resolved_within_sla integer NOT NULL,
    automated integer NOT NULL
);


--
-- Name: ibmams_ticket_trends_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ibmams_ticket_trends_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ibmams_ticket_trends_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ibmams_ticket_trends_id_seq OWNED BY public.ibmams_ticket_trends.id;


--
-- Name: incidents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.incidents (
    incident_id character varying(20) NOT NULL,
    severity character varying(10) NOT NULL,
    title text NOT NULL,
    affected_application character varying(255) NOT NULL,
    status character varying(20) NOT NULL,
    opened_at timestamp without time zone NOT NULL,
    resolved_at timestamp without time zone,
    mttr integer,
    root_cause text NOT NULL,
    assignee character varying(100) NOT NULL
);


--
-- Name: interfaces; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.interfaces (
    interface_id character varying(10) NOT NULL,
    name text NOT NULL,
    type character varying(20) NOT NULL,
    source_system character varying(100) NOT NULL,
    target_system character varying(100) NOT NULL,
    status character varying(20) NOT NULL,
    last_transmission timestamp without time zone NOT NULL,
    records_today integer NOT NULL,
    error_rate real NOT NULL
);


--
-- Name: member_enrollments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.member_enrollments (
    id integer NOT NULL,
    period_type character varying(10) NOT NULL,
    period_label character varying(50) NOT NULL,
    enrollments integer NOT NULL,
    terminations integer NOT NULL
);


--
-- Name: member_enrollments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.member_enrollments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: member_enrollments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.member_enrollments_id_seq OWNED BY public.member_enrollments.id;


--
-- Name: member_exceptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.member_exceptions (
    id character varying(20) NOT NULL,
    member_id character varying(20) NOT NULL,
    member_name character varying(100) NOT NULL,
    exception_type character varying(100) NOT NULL,
    product character varying(50) NOT NULL,
    age_days integer NOT NULL,
    status character varying(50) NOT NULL,
    priority character varying(10) NOT NULL
);


--
-- Name: page_kpis; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.page_kpis (
    id integer NOT NULL,
    page character varying(50) NOT NULL,
    kpi_key character varying(80) NOT NULL,
    label character varying(200) DEFAULT ''::character varying NOT NULL,
    value real DEFAULT 0 NOT NULL,
    formatted character varying(100) DEFAULT ''::character varying NOT NULL,
    change real DEFAULT 0 NOT NULL,
    status character varying(10) DEFAULT 'green'::character varying NOT NULL,
    trend character varying(10) DEFAULT 'flat'::character varying NOT NULL,
    display_order integer DEFAULT 0 NOT NULL
);


--
-- Name: page_kpis_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.page_kpis_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: page_kpis_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.page_kpis_id_seq OWNED BY public.page_kpis.id;


--
-- Name: priorauth_aging; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.priorauth_aging (
    id integer NOT NULL,
    bucket character varying(50) NOT NULL,
    count integer NOT NULL,
    percentage real NOT NULL,
    severity character varying(10) NOT NULL
);


--
-- Name: priorauth_aging_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.priorauth_aging_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: priorauth_aging_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.priorauth_aging_id_seq OWNED BY public.priorauth_aging.id;


--
-- Name: priorauth_procedures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.priorauth_procedures (
    id integer NOT NULL,
    category character varying(100) NOT NULL,
    requests integer NOT NULL,
    approval_rate real NOT NULL,
    avg_days real NOT NULL
);


--
-- Name: priorauth_procedures_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.priorauth_procedures_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: priorauth_procedures_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.priorauth_procedures_id_seq OWNED BY public.priorauth_procedures.id;


--
-- Name: priorauth_reviewers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.priorauth_reviewers (
    reviewer_id character varying(10) NOT NULL,
    reviewer_name character varying(100) NOT NULL,
    open_cases integer NOT NULL,
    completed_today integer NOT NULL,
    avg_days_to_decision real NOT NULL,
    status character varying(20) NOT NULL
);


--
-- Name: provider_issues; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.provider_issues (
    id integer NOT NULL,
    issue_type text NOT NULL,
    count integer NOT NULL,
    trend character varying(10) NOT NULL,
    priority character varying(10) NOT NULL
);


--
-- Name: provider_issues_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.provider_issues_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: provider_issues_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.provider_issues_id_seq OWNED BY public.provider_issues.id;


--
-- Name: providers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.providers (
    provider_id character varying(15) NOT NULL,
    provider_name character varying(255) NOT NULL,
    npi character varying(15) NOT NULL,
    specialty character varying(100) NOT NULL,
    status character varying(20) NOT NULL,
    credentialing_status character varying(50) NOT NULL,
    open_claims integer NOT NULL,
    open_tickets integer NOT NULL,
    last_updated character varying(10) NOT NULL
);


--
-- Name: roadmap_initiatives; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roadmap_initiatives (
    id integer NOT NULL,
    portfolio character varying(100) NOT NULL,
    product character varying(100) NOT NULL,
    application character varying(255) NOT NULL,
    initiative_type character varying(50) NOT NULL,
    description text NOT NULL,
    expected_outcome text NOT NULL,
    technology character varying(100) NOT NULL,
    current_version character varying(50) DEFAULT ''::character varying NOT NULL,
    upgrade_version character varying(50) DEFAULT ''::character varying NOT NULL,
    jira_id character varying(20) NOT NULL,
    service_category character varying(100) NOT NULL,
    start_date character varying(10) NOT NULL,
    end_date character varying(10) NOT NULL,
    status character varying(30) NOT NULL,
    priority character varying(20) NOT NULL,
    notes text DEFAULT ''::text NOT NULL,
    domain character varying(100) DEFAULT ''::character varying NOT NULL,
    plan_year integer DEFAULT 1 NOT NULL,
    plan_quarter character varying(5) DEFAULT 'Q1'::character varying NOT NULL,
    complexity character varying(10) DEFAULT 'Med'::character varying NOT NULL,
    business_impact text DEFAULT ''::text NOT NULL,
    dependency text DEFAULT ''::text NOT NULL
);


--
-- Name: roadmap_initiatives_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roadmap_initiatives_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roadmap_initiatives_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roadmap_initiatives_id_seq OWNED BY public.roadmap_initiatives.id;


--
-- Name: sla_compliance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sla_compliance (
    id character varying(30) NOT NULL,
    tower character varying(100) NOT NULL,
    target real NOT NULL,
    actual real NOT NULL,
    status character varying(20) NOT NULL,
    trend character varying(15) NOT NULL
);


--
-- Name: talent_plan_meta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.talent_plan_meta (
    id integer DEFAULT 1 NOT NULL,
    uploaded_at character varying(40) NOT NULL,
    uploaded_by character varying(255) NOT NULL,
    source_filename character varying(255) NOT NULL,
    resource_count integer NOT NULL,
    product_count integer NOT NULL,
    version integer NOT NULL,
    CONSTRAINT talent_plan_meta_id_check CHECK ((id = 1))
);


--
-- Name: talent_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.talent_products (
    id integer NOT NULL,
    domain character varying(100) DEFAULT ''::character varying NOT NULL,
    portfolio character varying(100) DEFAULT ''::character varying NOT NULL,
    product character varying(100) DEFAULT ''::character varying NOT NULL,
    application_area character varying(255) DEFAULT ''::character varying NOT NULL,
    current_tech text DEFAULT ''::text NOT NULL,
    future_tech text DEFAULT ''::text NOT NULL,
    industry text DEFAULT ''::text NOT NULL,
    agile text DEFAULT ''::text NOT NULL,
    agentic text DEFAULT ''::text NOT NULL,
    devsecops text DEFAULT ''::text NOT NULL,
    aiops text DEFAULT ''::text NOT NULL
);


--
-- Name: talent_products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.talent_products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: talent_products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.talent_products_id_seq OWNED BY public.talent_products.id;


--
-- Name: talent_resources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.talent_resources (
    id integer NOT NULL,
    serial character varying(30) NOT NULL,
    name character varying(255) NOT NULL,
    domain character varying(100) DEFAULT ''::character varying NOT NULL,
    portfolio character varying(100) DEFAULT ''::character varying NOT NULL,
    product character varying(100) DEFAULT ''::character varying NOT NULL,
    application_area character varying(255) DEFAULT ''::character varying NOT NULL,
    type_of_work character varying(100) DEFAULT ''::character varying NOT NULL,
    role character varying(100) DEFAULT ''::character varying NOT NULL,
    location character varying(100) DEFAULT ''::character varying NOT NULL,
    current_tech_stack text DEFAULT ''::text NOT NULL,
    current_future_tech text DEFAULT ''::text NOT NULL,
    current_industry text DEFAULT ''::text NOT NULL,
    current_agile text DEFAULT ''::text NOT NULL,
    current_agentic text DEFAULT ''::text NOT NULL,
    current_devsecops text DEFAULT ''::text NOT NULL,
    current_aiops text DEFAULT ''::text NOT NULL,
    plan_tech_stack text DEFAULT ''::text NOT NULL,
    plan_future_tech text DEFAULT ''::text NOT NULL,
    plan_industry text DEFAULT ''::text NOT NULL,
    plan_agile text DEFAULT ''::text NOT NULL,
    plan_agentic text DEFAULT ''::text NOT NULL,
    plan_devops text DEFAULT ''::text NOT NULL,
    plan_aiops text DEFAULT ''::text NOT NULL
);


--
-- Name: talent_resources_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.talent_resources_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: talent_resources_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.talent_resources_id_seq OWNED BY public.talent_resources.id;


--
-- Name: user_session_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_session_logs (
    id integer NOT NULL,
    user_id text NOT NULL,
    username character varying(255) NOT NULL,
    login_at timestamp without time zone DEFAULT now() NOT NULL,
    logout_at timestamp without time zone,
    session_duration_seconds integer,
    token text NOT NULL
);


--
-- Name: user_session_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_session_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_session_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_session_logs_id_seq OWNED BY public.user_session_logs.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id text NOT NULL,
    username character varying(255) NOT NULL,
    password_hash text NOT NULL,
    name character varying(255) NOT NULL,
    role character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    avatar character varying(10) NOT NULL,
    title character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: vendor_invoice_alerts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendor_invoice_alerts (
    id integer NOT NULL,
    alert_type character varying(50) NOT NULL,
    invoice_id character varying(20),
    vendor character varying(100) NOT NULL,
    message text NOT NULL,
    severity character varying(10) NOT NULL,
    amount integer
);


--
-- Name: vendor_invoice_alerts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vendor_invoice_alerts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vendor_invoice_alerts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vendor_invoice_alerts_id_seq OWNED BY public.vendor_invoice_alerts.id;


--
-- Name: vendor_invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendor_invoices (
    id character varying(20) NOT NULL,
    vendor character varying(100) NOT NULL,
    work_number character varying(20) NOT NULL,
    service_category character varying(50) NOT NULL,
    invoice_date character varying(15) NOT NULL,
    amount integer NOT NULL,
    status character varying(20) NOT NULL,
    payment_status character varying(20) NOT NULL,
    age_days integer NOT NULL,
    cycle_time_days real,
    has_exception integer DEFAULT 0 NOT NULL,
    exception_note text
);


--
-- Name: capability_ai_certs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capability_ai_certs ALTER COLUMN id SET DEFAULT nextval('public.capability_ai_certs_id_seq'::regclass);


--
-- Name: capability_areas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capability_areas ALTER COLUMN id SET DEFAULT nextval('public.capability_areas_id_seq'::regclass);


--
-- Name: capability_governance id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capability_governance ALTER COLUMN id SET DEFAULT nextval('public.capability_governance_id_seq'::regclass);


--
-- Name: capability_kpis id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capability_kpis ALTER COLUMN id SET DEFAULT nextval('public.capability_kpis_id_seq'::regclass);


--
-- Name: capability_radar id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capability_radar ALTER COLUMN id SET DEFAULT nextval('public.capability_radar_id_seq'::regclass);


--
-- Name: capability_stages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capability_stages ALTER COLUMN id SET DEFAULT nextval('public.capability_stages_id_seq'::regclass);


--
-- Name: capability_training id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capability_training ALTER COLUMN id SET DEFAULT nextval('public.capability_training_id_seq'::regclass);


--
-- Name: capability_value_impact id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capability_value_impact ALTER COLUMN id SET DEFAULT nextval('public.capability_value_impact_id_seq'::regclass);


--
-- Name: capability_workforce_transformation id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capability_workforce_transformation ALTER COLUMN id SET DEFAULT nextval('public.capability_workforce_transformation_id_seq'::regclass);


--
-- Name: claims_aging id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.claims_aging ALTER COLUMN id SET DEFAULT nextval('public.claims_aging_id_seq'::regclass);


--
-- Name: claims_denial_reasons id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.claims_denial_reasons ALTER COLUMN id SET DEFAULT nextval('public.claims_denial_reasons_id_seq'::regclass);


--
-- Name: claims_lob_stats id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.claims_lob_stats ALTER COLUMN id SET DEFAULT nextval('public.claims_lob_stats_id_seq'::regclass);


--
-- Name: contactcenter_call_reasons id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contactcenter_call_reasons ALTER COLUMN id SET DEFAULT nextval('public.contactcenter_call_reasons_id_seq'::regclass);


--
-- Name: contactcenter_hourly id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contactcenter_hourly ALTER COLUMN id SET DEFAULT nextval('public.contactcenter_hourly_id_seq'::regclass);


--
-- Name: ibmams_savings_trend id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ibmams_savings_trend ALTER COLUMN id SET DEFAULT nextval('public.ibmams_savings_trend_id_seq'::regclass);


--
-- Name: ibmams_ticket_trends id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ibmams_ticket_trends ALTER COLUMN id SET DEFAULT nextval('public.ibmams_ticket_trends_id_seq'::regclass);


--
-- Name: member_enrollments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_enrollments ALTER COLUMN id SET DEFAULT nextval('public.member_enrollments_id_seq'::regclass);


--
-- Name: page_kpis id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_kpis ALTER COLUMN id SET DEFAULT nextval('public.page_kpis_id_seq'::regclass);


--
-- Name: priorauth_aging id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.priorauth_aging ALTER COLUMN id SET DEFAULT nextval('public.priorauth_aging_id_seq'::regclass);


--
-- Name: priorauth_procedures id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.priorauth_procedures ALTER COLUMN id SET DEFAULT nextval('public.priorauth_procedures_id_seq'::regclass);


--
-- Name: provider_issues id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_issues ALTER COLUMN id SET DEFAULT nextval('public.provider_issues_id_seq'::regclass);


--
-- Name: roadmap_initiatives id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roadmap_initiatives ALTER COLUMN id SET DEFAULT nextval('public.roadmap_initiatives_id_seq'::regclass);


--
-- Name: talent_products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.talent_products ALTER COLUMN id SET DEFAULT nextval('public.talent_products_id_seq'::regclass);


--
-- Name: talent_resources id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.talent_resources ALTER COLUMN id SET DEFAULT nextval('public.talent_resources_id_seq'::regclass);


--
-- Name: user_session_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_session_logs ALTER COLUMN id SET DEFAULT nextval('public.user_session_logs_id_seq'::regclass);


--
-- Name: vendor_invoice_alerts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_invoice_alerts ALTER COLUMN id SET DEFAULT nextval('public.vendor_invoice_alerts_id_seq'::regclass);


--
-- Name: ai_insights ai_insights_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_insights
    ADD CONSTRAINT ai_insights_pkey PRIMARY KEY (id);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (app_id);


--
-- Name: batch_jobs batch_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.batch_jobs
    ADD CONSTRAINT batch_jobs_pkey PRIMARY KEY (job_id);


--
-- Name: capability_ai_certs capability_ai_certs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capability_ai_certs
    ADD CONSTRAINT capability_ai_certs_pkey PRIMARY KEY (id);


--
-- Name: capability_areas capability_areas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capability_areas
    ADD CONSTRAINT capability_areas_pkey PRIMARY KEY (id);


--
-- Name: capability_governance capability_governance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capability_governance
    ADD CONSTRAINT capability_governance_pkey PRIMARY KEY (id);


--
-- Name: capability_kpis capability_kpis_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capability_kpis
    ADD CONSTRAINT capability_kpis_pkey PRIMARY KEY (id);


--
-- Name: capability_radar capability_radar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capability_radar
    ADD CONSTRAINT capability_radar_pkey PRIMARY KEY (id);


--
-- Name: capability_stages capability_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capability_stages
    ADD CONSTRAINT capability_stages_pkey PRIMARY KEY (id);


--
-- Name: capability_training capability_training_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capability_training
    ADD CONSTRAINT capability_training_pkey PRIMARY KEY (id);


--
-- Name: capability_value_impact capability_value_impact_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capability_value_impact
    ADD CONSTRAINT capability_value_impact_pkey PRIMARY KEY (id);


--
-- Name: capability_workforce_transformation capability_workforce_transformation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capability_workforce_transformation
    ADD CONSTRAINT capability_workforce_transformation_pkey PRIMARY KEY (id);


--
-- Name: claims_aging claims_aging_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.claims_aging
    ADD CONSTRAINT claims_aging_pkey PRIMARY KEY (id);


--
-- Name: claims_denial_reasons claims_denial_reasons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.claims_denial_reasons
    ADD CONSTRAINT claims_denial_reasons_pkey PRIMARY KEY (id);


--
-- Name: claims_lob_stats claims_lob_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.claims_lob_stats
    ADD CONSTRAINT claims_lob_stats_pkey PRIMARY KEY (id);


--
-- Name: claims claims_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.claims
    ADD CONSTRAINT claims_pkey PRIMARY KEY (claim_id);


--
-- Name: contactcenter_call_reasons contactcenter_call_reasons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contactcenter_call_reasons
    ADD CONSTRAINT contactcenter_call_reasons_pkey PRIMARY KEY (id);


--
-- Name: contactcenter_hourly contactcenter_hourly_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contactcenter_hourly
    ADD CONSTRAINT contactcenter_hourly_pkey PRIMARY KEY (id);


--
-- Name: daily_trends daily_trends_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_trends
    ADD CONSTRAINT daily_trends_pkey PRIMARY KEY (id);


--
-- Name: daily_trends daily_trends_trend_date_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_trends
    ADD CONSTRAINT daily_trends_trend_date_unique UNIQUE (trend_date);


--
-- Name: executive_alerts executive_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.executive_alerts
    ADD CONSTRAINT executive_alerts_pkey PRIMARY KEY (id);


--
-- Name: ibmams_runbooks ibmams_runbooks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ibmams_runbooks
    ADD CONSTRAINT ibmams_runbooks_pkey PRIMARY KEY (runbook_id);


--
-- Name: ibmams_savings_trend ibmams_savings_trend_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ibmams_savings_trend
    ADD CONSTRAINT ibmams_savings_trend_pkey PRIMARY KEY (id);


--
-- Name: ibmams_ticket_trends ibmams_ticket_trends_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ibmams_ticket_trends
    ADD CONSTRAINT ibmams_ticket_trends_pkey PRIMARY KEY (id);


--
-- Name: incidents incidents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incidents
    ADD CONSTRAINT incidents_pkey PRIMARY KEY (incident_id);


--
-- Name: interfaces interfaces_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interfaces
    ADD CONSTRAINT interfaces_pkey PRIMARY KEY (interface_id);


--
-- Name: member_enrollments member_enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_enrollments
    ADD CONSTRAINT member_enrollments_pkey PRIMARY KEY (id);


--
-- Name: member_exceptions member_exceptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_exceptions
    ADD CONSTRAINT member_exceptions_pkey PRIMARY KEY (id);


--
-- Name: page_kpis page_kpis_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_kpis
    ADD CONSTRAINT page_kpis_pkey PRIMARY KEY (id);


--
-- Name: priorauth_aging priorauth_aging_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.priorauth_aging
    ADD CONSTRAINT priorauth_aging_pkey PRIMARY KEY (id);


--
-- Name: priorauth_procedures priorauth_procedures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.priorauth_procedures
    ADD CONSTRAINT priorauth_procedures_pkey PRIMARY KEY (id);


--
-- Name: priorauth_reviewers priorauth_reviewers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.priorauth_reviewers
    ADD CONSTRAINT priorauth_reviewers_pkey PRIMARY KEY (reviewer_id);


--
-- Name: provider_issues provider_issues_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_issues
    ADD CONSTRAINT provider_issues_pkey PRIMARY KEY (id);


--
-- Name: providers providers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT providers_pkey PRIMARY KEY (provider_id);


--
-- Name: roadmap_initiatives roadmap_initiatives_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roadmap_initiatives
    ADD CONSTRAINT roadmap_initiatives_pkey PRIMARY KEY (id);


--
-- Name: roadmap_initiatives roadmap_initiatives_work_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roadmap_initiatives
    ADD CONSTRAINT roadmap_initiatives_work_number_key UNIQUE (jira_id);


--
-- Name: sla_compliance sla_compliance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sla_compliance
    ADD CONSTRAINT sla_compliance_pkey PRIMARY KEY (id);


--
-- Name: talent_plan_meta talent_plan_meta_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.talent_plan_meta
    ADD CONSTRAINT talent_plan_meta_pkey PRIMARY KEY (id);


--
-- Name: talent_products talent_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.talent_products
    ADD CONSTRAINT talent_products_pkey PRIMARY KEY (id);


--
-- Name: talent_resources talent_resources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.talent_resources
    ADD CONSTRAINT talent_resources_pkey PRIMARY KEY (id);


--
-- Name: user_session_logs user_session_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_session_logs
    ADD CONSTRAINT user_session_logs_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: vendor_invoice_alerts vendor_invoice_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_invoice_alerts
    ADD CONSTRAINT vendor_invoice_alerts_pkey PRIMARY KEY (id);


--
-- Name: vendor_invoices vendor_invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_invoices
    ADD CONSTRAINT vendor_invoices_pkey PRIMARY KEY (id);


--
-- Name: page_kpis_page_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX page_kpis_page_idx ON public.page_kpis USING btree (page);


--
-- PostgreSQL database dump complete
--

\unrestrict U5mcX9C5zMu740s8sfuxOzbbLSEzz76aNYrmswYEl43Cd555i3wdblLmyafboYI

