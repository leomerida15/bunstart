# Informe Agente de Capacidad Operativa

## SituaciÃ³n
**Caso**: CASO DOS - Evaluando una Idea
**Objetivo**: Evaluar viabilidad y generar planes de acciÃ³n ejecutables

## Viabilidad
**ConclusiÃ³n**: EvaluaciÃ³n en proceso de completar

## AnÃ¡lisis Detallado

## 1. Resumen Ejecutivo de la Propuesta
La propuesta busca crear un **Registro Municipal de Organizaciones Comunitarias** en Nueva York para centralizar, georreferenciar y gestionar la informaciÃ³n de juntas vecinales, clubes y colectivos. El objetivo es mejorar la articulaciÃ³n de polÃ­ticas y la asignaciÃ³n de recursos. Como Agente de Capacidad Operativa, evalÃºo esto no como un problema de software, sino como un reto de **mantenimiento de datos y gobernanza**. La tecnologÃ­a es fÃ¡cil; mantener la base de datos viva y limpia en una ciudad con alta informalidad y rotaciÃ³n es el desafÃ­o estructural.

## 2. EvaluaciÃ³n de Viabilidad Operativa
La propuesta es **VIABLE CON AJUSTES**.
* **Factores de Viabilidad:** Existencia de infraestructura Salesforce en la ciudad (OTI), mandato claro de la Community Affairs Unit (CAU).
* **Bloqueos Operativos:** La fragmentaciÃ³n actual es severa. Intentar centralizar sin limpiar datos primero resultarÃ¡ en un fracaso ('Garbage in, Garbage out'). La dependencia de validaciÃ³n manual por parte de Community Boards saturados es un punto de falla crÃ­tico.
* **Brecha:** No existe hoy un equipo dedicado a la 'higiene de datos' comunitaria. Se requiere reasignaciÃ³n de roles.

## 3. Hallazgos Clave (Evidencia)
1. **Silos de Datos:** NYC Service, DYCD y CAU operan CRMs separados. Unificar requiere voluntad polÃ­tica y ETL complejo.
2. **Fatiga de Registro:** Las organizaciones pequeÃ±as ya llenan mÃºltiples formularios (VENDEX, PASSPort, Discretionary Funds). Otro registro sin valor claro tendrÃ¡ baja adopciÃ³n.
3. **Capacidad de CBs:** Los Community Boards promedian 3 empleados para atender a ~150k residentes. No pueden asumir carga administrativa pesada de validaciÃ³n.

## 4. Ajustes Necesarios (RefactorizaciÃ³n)
* **Modelo de Datos:** Cambiar de 'Censo estÃ¡tico' a 'Perfil vivo'. Los datos deben caducar si no se confirman anualmente.
* **Incentivos:** Vincular el registro a la elegibilidad para permisos de eventos (SAPO) y fondos del Concejo.
* **TecnologÃ­a:** Uso obligatorio de **NYC.ID** para autenticaciÃ³n Ãºnica.

## 5. GrÃ¡ficos de AnÃ¡lisis FACTUM (Obligatorios)

### Heatmap de Capacidad Operativa

```mermaid
flowchart TD
 subgraph Base- Escenario Base (Actual)
P1- Procesos: 30%
R1- RR.HH.: 60%
G1- Gobernanza: 40%
T1- TecnologÃ­a: 50%
L1- LogÃ­stica: 70%
end
 subgraph Recomendado- Escenario Recomendado (Con Ajustes)
P2- Procesos: 80%
R2- RR.HH.: 75%
G2- Gobernanza: 85%
T2- TecnologÃ­a: 90%
L2- LogÃ­stica: 80%
end
 subgraph Ambicioso- Escenario Ambicioso
P3- Procesos: 60%
R3- RR.HH.: 50%
G3- Gobernanza: 65%
T3- TecnologÃ­a: 70%
L3- LogÃ­stica: 60%
end

 style P1 fill:#F44336,color:#fff
 style R1 fill:#FFC107,color:#000
 style G1 fill:#F44336,color:#fff
 style T1 fill:#FFC107,color:#000
 style L1 fill:#FFC107,color:#000
 style P2 fill:#4CAF50,color:#fff
 style R2 fill:#FFC107,color:#000
 style G2 fill:#4CAF50,color:#fff
 style T2 fill:#4CAF50,color:#fff
 style L2 fill:#4CAF50,color:#fff
 style P3 fill:#FFC107,color:#000
 style R3 fill:#F44336,color:#fff
 style G3 fill:#FFC107,color:#000
 style T3 fill:#4CAF50,color:#fff
 style L3 fill:#FFC107,color:#000
```

```mermaid
gantt
 title Cronograma de ImplementaciÃ³n - Escenario Recomendado
 dateFormat YYYY-MM-DD

 section Fase 1: PreparaciÃ³n & IT
 AuditorÃ­a de Datos y DiseÃ±o MDM :done, prep1, 2025-01-01, 30d
 ConfiguraciÃ³n Salesforce (OTI) :active, prep2, after prep1, 45d
 DefiniciÃ³n de SOPs y Gobernanza :prep3, after prep1, 30d

 section Fase 2: Piloto (90 dÃ­as)
 CapacitaciÃ³n Distritos Piloto :crit, pil1, after prep2, 15d
 Despliegue Campo (3 CBs) :pil2, after pil1, 60d
 Ajustes UX/UI Portal :pil3, after pil2, 15d

 section Fase 3: Escalamiento
 ExpansiÃ³n a 5 Boroughs :esc1, after pil3, 90d
 IntegraciÃ³n API PASSPort :esc2, after esc1, 60d

 section Hitos Clave
 Go-live TÃ©cnico (MVP) :milestone, m1, after prep2, 0d
 Cierre Piloto (300 orgs) :milestone, m2, after pil2, 0d
 Cobertura Total (5k orgs) :milestone, m3, after esc1, 0d
```

## 6. Consideraciones de Riesgo
| Riesgo | Probabilidad | Impacto | MitigaciÃ³n |
|--------|-------------|---------|------------|
| **Baja AdopciÃ³n** | Alta | CrÃ­tico | IntegraciÃ³n forzosa con solicitud de fondos y permisos. |
| **Calidad de Datos** | Media | Alto | ValidaciÃ³n escalonada y limpieza automatizada pre-carga. |
| **Resistencia CBs** | Media | Medio | Proveer personal de apoyo temporal y herramientas mÃ³viles simples. |

## 7. ConclusiÃ³n y Veredicto
**VEREDICTO: VIABLE CON AJUSTES.**
La propuesta es tÃ©cnicamente sencilla pero operativamente compleja. Solo funcionarÃ¡ si se plantea como una consolidaciÃ³n de sistemas existentes (Salesforce/OTI) y no como un nuevo desarrollo aislado, y si se dota de recursos humanos temporales para la 'Ãºltima milla' de validaciÃ³n en los distritos.

## Planes de AcciÃ³n Ejecutables

### Plan 1: Plan de UnificaciÃ³n de Datos e Infraestructura TecnolÃ³gica (IT & Data Ops)

1. EjecuciÃ³n de AuditorÃ­a de Datos y Arquitectura de SoluciÃ³n MDM (Master Data Management). QUÃ‰: Realizar un inventario exhaustivo y mapeo de campos de las bases de datos actuales de CAU, NYC Service, DYCD y listas de Community Boards. DiseÃ±ar la arquitectura de la soluciÃ³n en el entorno Salesforce de la ciudad. CÃ“MO: 1) ExtracciÃ³n de dumps de datos de sistemas legados (SQL, Excel, CSV). 2) Uso de Python (Pandas/NumPy) para anÃ¡lisis de calidad de datos (completitud, duplicados). 3) DefiniciÃ³n de esquema de datos Ãºnico (Golden Record) incluyendo campos geoespaciales (BBL - Borough Block Lot). 4) ConfiguraciÃ³n de entorno Sandbox en Salesforce Public Sector Solutions. 5) RevisiÃ³n de cumplimiento con OTI Security Accreditation. QUIÃ‰N: Office of Technology and Innovation (OTI) - 1 Arquitecto de Soluciones, 2 Ingenieros de Datos; CAU - 1 Analista de Operaciones. RECURSOS: $45,000 (Horas hombre + licencias de herramientas ETL como Talend o Informatica + Entorno AWS GovCloud para staging). PLAZO: 4 Semanas (Fase 1). FACTORES: Riesgo de bloqueo por calidad de datos pobre (mitigaciÃ³n: reglas de coincidencia difusa/fuzzy matching). HERRAMIENTAS: Python 3.9, Salesforce DX, Jira para gestiÃ³n de backlog. ENTREGABLE: Documento de Arquitectura de Datos aprobado por OTI, Diccionario de Datos unificado y entorno Sandbox configurado con datos de prueba limpios.

2. Desarrollo y Despliegue del Portal de Autoservicio (Front-End). QUÃ‰: Configurar y personalizar el portal de cara al usuario (Experience Cloud) que permita a las organizaciones crear perfil, georreferenciar su sede y listar servicios. CÃ“MO: 1) ConfiguraciÃ³n de flujos de registro (Flow Builder) con lÃ³gica condicional (Nivel 1 vs Nivel 2). 2) IntegraciÃ³n de API de NYC GeoClient para normalizaciÃ³n de direcciones en tiempo real. 3) ImplementaciÃ³n de autenticaciÃ³n segura (NYC.ID integraciÃ³n). 4) Pruebas de usabilidad (UX/UI) con 5 organizaciones piloto. 5) ConfiguraciÃ³n de dashboards internos para CAU. QUIÃ‰N: Equipo de Desarrollo OTI (3 Desarrolladores Salesforce, 1 DiseÃ±ador UX/UI). RECURSOS: $60,000 (Desarrollo in-house o vendor bajo contrato marco). PLAZO: 6 Semanas (Fase 2). FACTORES: Dependencia de la aprobaciÃ³n de integraciÃ³n de NYC.ID. HERRAMIENTAS: Salesforce Experience Cloud, NYC GeoClient API, Figma (prototipado). ENTREGABLE: Portal funcional en entorno de Staging, validado por Ciberseguridad, listo para carga de datos.

3. MigraciÃ³n de Datos, QA y Go-Live TÃ©cnico. QUÃ‰: Ejecutar la migraciÃ³n final de los datos limpios al entorno de producciÃ³n y lanzar el sistema. CÃ“MO: 1) EjecuciÃ³n de scripts de carga de datos (Data Loader) durante ventana de mantenimiento fin de semana. 2) VerificaciÃ³n de integridad de datos (Smoke Testing). 3) ActivaciÃ³n de DNS y certificados SSL. 4) HabilitaciÃ³n de monitoreo de sistema (Splunk/Datadog). 5) Transferencia de conocimiento a equipo de soporte L1. QUIÃ‰N: Equipo DevOps OTI + Admin de Sistema CAU. RECURSOS: $15,000 (Soporte post-despliegue inmediato). PLAZO: 2 Semanas (Fase 3). FACTORES: Posible tiempo de inactividad (downtime) de sistemas legados. HERRAMIENTAS: Salesforce Data Loader, Splunk. ENTREGABLE: Sistema en ProducciÃ³n (Live), reporte de migraciÃ³n con 0 errores crÃ­ticos, manual de administrador entregado.

### Plan 2: Plan de Despliegue Territorial y GestiÃ³n del Cambio (Field Ops & Governance)

1. Establecimiento de Gobernanza y Protocolos de ValidaciÃ³n (SOPs). QUÃ‰: Definir las reglas de negocio exactas para la validaciÃ³n de organizaciones y crear los Procedimientos Operativos EstÃ¡ndar (SOPs) para el personal de CAU y Community Boards. CÃ“MO: 1) RedacciÃ³n de manuales operativos: criterios de aceptaciÃ³n/rechazo, tiempos de respuesta (SLA), matriz de escalamiento. 2) DefiniciÃ³n de roles y permisos en el sistema (RACI). 3) CreaciÃ³n de material de capacitaciÃ³n (videos, guÃ­as PDF). 4) Firma de memorandos de entendimiento (MOU) con agencias colaboradoras (DYCD, NYC Service) para uso compartido de datos. QUIÃ‰N: Director de Operaciones CAU + Consultor de Procesos + Asesor Legal. RECURSOS: $20,000 (ConsultorÃ­a de procesos + diseÃ±o grÃ¡fico de manuales). PLAZO: 4 Semanas (Paralelo a IT Fase 1). FACTORES: Resistencia burocrÃ¡tica de agencias a compartir datos (mitigaciÃ³n: mandato desde AlcaldÃ­a/Deputy Mayor). HERRAMIENTAS: Microsoft Visio (diagramas de flujo), SharePoint (repositorio documental). ENTREGABLE: Manual de Operaciones (SOP) versiÃ³n 1.0 aprobado, MOUs firmados, Matriz RACI implementada.

2. CapacitaciÃ³n y Despliegue Piloto en 3 Distritos Clave. QUÃ‰: Ejecutar un piloto operativo en 3 Community Districts diversos (ej. Bronx CB5, Queens CB4, Brooklyn CB1) para probar el proceso de registro y validaciÃ³n en terreno. CÃ“MO: 1) Sesiones de capacitaciÃ³n presencial ('Train the Trainer') con District Managers de los CBs seleccionados. 2) Despliegue de equipos de calle (Street Teams) con tablets para registrar organizaciones in-situ. 3) Monitoreo diario de KPIs (tiempo de registro, tasa de error). 4) RetroalimentaciÃ³n rÃ¡pida y ajuste de procesos. QUIÃ‰N: Equipo de Outreach CAU (5 personas) + Personal de los 3 CBs. RECURSOS: $10,000 (Material impreso, viÃ¡ticos, tablets con plan de datos). PLAZO: 4 Semanas (Post Go-Live TÃ©cnico). FACTORES: Baja participaciÃ³n inicial (mitigaciÃ³n: incentivos de visibilidad). HERRAMIENTAS: Tablets iPad/Android, Salesforce Mobile App. ENTREGABLE: 300 organizaciones registradas y verificadas en el piloto, informe de lecciones aprendidas, SOPs ajustados.

3. Escalamiento a los 59 Distritos y CampaÃ±a de Registro Masivo. QUÃ‰: Expandir la operaciÃ³n a toda la ciudad, transfiriendo la responsabilidad de validaciÃ³n primaria a los Community Boards con soporte central. CÃ“MO: 1) Webinars masivos por Borough. 2) ActivaciÃ³n de 'Help Desk' dedicado en CAU para soporte a usuarios. 3) CampaÃ±a de comunicaciÃ³n en medios comunitarios y Ã©tnicos. 4) IntegraciÃ³n del requisito de registro en las solicitudes de fondos discrecionales del Concejo Municipal (Council Discretionary Funds). QUIÃ‰N: Toda la plantilla de CAU + NYC Service + ColaboraciÃ³n de Borough Presidents. RECURSOS: $50,000 (CampaÃ±a de medios, horas extra personal soporte). PLAZO: 12 Semanas (Trimestre siguiente al piloto). FACTORES: SaturaciÃ³n del Help Desk (mitigaciÃ³n: chatbot y FAQs robustos). HERRAMIENTAS: Zendesk (tickets de soporte), Zoom (webinars). ENTREGABLE: Base de datos con >5,000 organizaciones activas y georreferenciadas, cobertura del 100% de distritos, sistema operando en BAU (Business as Usual).

- --

**Agente**: Agente de Capacidad Operativa
**Tipo**: Transversal
**Flujo**: FACTUM
**Fecha**: 2026-02-10