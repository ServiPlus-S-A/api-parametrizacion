f

| Serviplus Software Architecture Document | \[12 de mayo 2026\] 2026 |  |
| :---: | :---: | :---: |
| \[Escriba aquí una descripción breve del documento. Normalmente, una descripción breve es un resumen corto del contenido del documento. Escriba aquí una descripción breve del documento. Normalmente, una descripción breve es un resumen corto del contenido del documento.\] |  | Yummy Inc |

**Control de Cambios**

| Creación del documento |  |  |  |  |  |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **Autor** | Juan David Rincón LópezDaniel Andrade ReyesJuan José CortésAllan Paredes Juan Felipe Osorio Zapata Miguel Castillo |  |  | **Fecha** | 04/03/2026 |
| **Revisado por** | **Nombre** |  |  | **Fecha** | Seleccione una Fecha |
|  | **Cargo** |  |  |  |  |
| **Aprobado por** | **Nombre** |  |  | **Fecha** | Seleccione una Fecha |
|  | **Cargo** |  |  |  |  |
| **Versión**  | **Descripción** | **Autor** | **Aprobado Por** | **Fecha Aprobación** |  |
|  |  |  |  | Seleccione una Fecha |  |
|  |  |  |  |  |  |

**TABLA DE CONTENIDO**

[**1\.	INTRODUCCIÓN	3**](#heading=h.jserk3qf22eu)

[1.1	Propósito	3](#heading=h.2nwyz616kq3u)  
[1.2	Alcance	3](#heading=h.k1kp01xoa00q)  
[1.3	Definiciones, siglas y abreviaturas	3](#heading=h.esql9ejssvaf)  
[1.4	Referencias	3](#heading=h.3vj4zmh5f4m)  
[1.5	Vista Global	3](#heading=h.2j5dbxi4mzcw)

[**2\.	MACRO ARQUITECTURA	3**](#heading=h.xkjmarg5yuok)

[2.1	Metas y Restricciones Arquitectónicas	3](#heading=h.jampwwlnhzf7)

[**3\.	VISTA FÍSICA	6**](#heading=h.xf68ieuamubn)

[**4\.	VISTA FUNCIONAL O LÓGICA	6**](#heading=h.fauc3v6pbpyq)

[**5\.	VISTA DE DESPLIEGUE	7**](#heading=h.avgvy47tti7m)

1. **Introducción**

**Visión general**

El presente Documento de Arquitectura de Software (DAS) describe la arquitectura diseñada para la plataforma **ServiPlus**, con un enfoque específico en el módulo de Parametrización. Este documento captura las decisiones arquitectónicas críticas, la selección del stack tecnológico y los principios de diseño estructural que garantizan el cumplimiento de los requerimientos funcionales y los atributos de calidad exigidos por el negocio. 

2. **Propósito**

**Rol del documento**

El propósito fundamental de este DAS es servir como la única fuente de verdad y guía principal para el diseño y construcción del módulo de Parametrización de ServiPlus. Su función es documentar y justificar técnicamente el "por qué" detrás de cada decisión, asegurando que el equipo de ingeniería comparta una visión unificada sobre cómo el sistema debe ser estructurado, desarrollado y desplegado 

3. **Alcance**

Este documento abarca la definición de la arquitectura a nivel de código (Atributos Observables) y a nivel de infraestructura (Atributos No Observables). Aplica directamente al equipo de desarrollo de Parametrización e incluye las pautas de integración con otros servicios (como Atención al Cliente y Solicitudes). El alcance tecnológico cubre la interacción entre el Frontend, el componente orquestador (BFF \- *Backend For Frontend*), y la capa de persistencia de datos. 

1. **Decisiones arquitecturales:** Definición del stack tecnológico (Full TypeScript) y la estrategia de API Rest  
2. **Módulos y funcionalidades:** Delimitación de responsabilidades entre el frontend y el backend orquestador.  
3. **Alcance del documento:** Límites de intervención del equipo de Parametrización respecto a otros módulos.  
4. **Atributos de calidad:** Categorizados estrictamente según su naturaleza de implementación:  
   1. **Observables:** Decisiones que impactan directamente el código fuente (validaciones, middlewares, DTOs).  
   2. **No observables:** Decisiones que recaen sobre la infraestructura y configuración (Docker, API Gateway).  
5. **Patrones y técnicas de diseño:** Identificación de patrones estructurales y de comportamiento (BFF, Factory, Observer) y demás técnicas de programación que nos permiten cumplir con los atributos de calidad.  
6. **Atributos Vs Patrones:** Justificación técnica de qué patrón o técnica resuelve qué atributo de calidad.  
7. **Representación de la solución:** Uso de vistas UML basadas en el modelo 4+1 de Kruchten (Lógica y Despliegue) para ilustrar la interacción del sistema.

   

4. **Definiciones, siglas y abreviaturas**

Para una correcta interpretación de este documento, se establecen las siguientes siglas:

* **DAS:** Documento de Arquitectura de Software.  
* **BFF (Backend For Frontend):** Patrón arquitectónico que actúa como un intermediario entre el cliente (Frontend) y el API Gateway con el microservicio de parametrización  
* **SSR (Server-Side Rendering):** Renderizado del lado del servidor utilizado para optimizar la carga de interfaces.  
* **DTO (Data Transfer Object):** Objeto utilizado para encapsular y transportar datos, filtrando la entrada a la lógica de negocio.  
* **JWT (JSON Web Token):** Estándar para la transmisión segura de información y autenticación.  
* **ORM (Object-Relational Mapping):** Técnica de programación para convertir datos entre sistemas de tipos incompatibles utilizando bases de datos relacionales (Ej. TypeORM).  
* **ACID:** Propiedades de transacciones en bases de datos (Atomicidad, Consistencia, Aislamiento, Durabilidad).


5. **Referencias**

| Documento | Versión | Fecha de la versión |
| :---- | ----- | :---: |
| Product Backlog Parametrizacion | 1.1 | 09/03/2026 |
| Normas ISO 25010 | ISO/IEC 25010:2023  | 11/05/2026 |
|  |  |  |
|  |  |  |

6. **Vista Global**

El resto del documento está organizado para desglosar la arquitectura desde su concepción más abstracta hasta su implementación física. La estructura guía al lector a través de las tres capas principales del sistema:

* **Capa de Presentación:** Aborda la interfaz de usuario, optimización de peticiones y experiencia del cliente.  
* **Capa de Lógica de Negocios:** Explica la orquestación de servicios, validación de reglas contables y comunicación entre dominios.  
* **Capa de Acceso a Datos:** Detalla la persistencia, seguridad transaccional y esquemas de base de datos.  
  Posteriormente, el documento profundiza en la matriz de atributos de calidad y finaliza con los diagramas UML correspondientes.


7. **Macro Arquitectura**

La arquitectura de software de ServiPlus está diseñada bajo un enfoque de API Gateway y el microservicio de parametrización **con el patrón BFF** y estructurada internamente mediante el modelo **Multicapa (N-Tier)**. Esta separación garantiza alta cohesión y bajo acoplamiento.

* **Capa de Presentación (Frontend):** Construida con **Next.js** (React). Se encarga exclusivamente de renderizar las interfaces (SSR), manejar el estado visual del usuario y optimizar peticiones redundantes.  
* **Capa de Lógica de Negocios (Backend Orquestador y Microservicio de parametrización):** Desarrollada en **NestJS**. Se divide en dos subniveles:  
  * *El Servidor BFF:* Actúa como API Gateway interno para el frontend. Recibe la petición, verifica la seguridad (JWT) y decide a qué microservicio consultar.  
  * *Microservicio de parametrización:* Contienen las reglas de negocio estrictas, los servicios y controladores específicos de su dominio.  
* **Capa de Acceso a Datos:** Gestionada a través de **TypeORM** sobre una base de datos relacional (PostgreSQL/Supabase). Administra las transacciones, bloqueos optimistas y esquemas físicos.

**Comunicación entre capas:**  
La comunicación es estrictamente unidireccional y basada en red. La Capa de Presentación se comunica con el BFF a través de peticiones HTTP/HTTPS (REST). El BFF, mediante librerías como *Axios* o clientes HTTP nativos, se comunica internamente con el Api gateway. Finalmente, los el microservicio son los únicos autorizados para comunicarse con la Capa de Acceso a Datos a través del ORM.

8. **Metas y Restricciones Arquitectónicas**

La arquitectura del sistema está condicionada por un conjunto de requerimientos y restricciones que impactan directamente su diseño: 

| Atributos de Calidad “Observables” |  |  |  |
| ----- | ----- | ----- | ----- |
| **Atributo de Calidad** | **Descripción**  | **Tácticas /Patrón de Diseño** | **Dónde se aplica**  |
| **Adecuación funcional:↳ Completitud funcional**  | Grado en el que el conjunto de funcionalidades del producto cubre todas las tareas y los objetivos de usuario especificados. | **Patrón: BFF \+ Fachada Técnica de Testing:** Pruebas Unitarias |  En la implementación de pruebas unitarias para garantizar la correctitud y manejo de excepciones en el código. (Ej: HU-01 registro de cliente, HU-06 crear servicio). El patrón BFF \+ Fachada garantiza que cada funcionalidad del backlog tiene un endpoint definido y completo. Las pruebas unitarias verifican que reglas de negocio estrictas (ej. contraseñas con mayúsculas/números, NIT  único) se cumplan antes de persistir en la BD.  |
| **Adecuación funcional ↳ Corrección funcional** | Capacidad del producto o sistema para proveer resultados exactos cuando es usado por los usuarios especificados. |  **Patrón: Repository (TypeORM)  Técnica**:  Pruebas Unitarias de casos límite  | Capa de Repositorios: centraliza todas las consultas y operaciones de persistencia. Las pruebas unitarias verifican los resultados en los casos límite de la lógica de negocio. |
| **Adecuación funcional ↳ Pertinencia funcional** |  Capacidad del producto software para proporcionar un conjunto de funciones que facilitan la consecución de tareas y objetivos de usuario especificados. | **Patrón: Fachada Técnicas:**  Pruebas de aceptación User Story Mapping  |  El patrón Fachada adapta y agrupa las operaciones del backend a las necesidades exactas del Frontend.  Esto hace que la API sea funcionalmente pertinente, ya que entrega la información estructurada exactamente como la vista (Next.js) la necesita para cumplir su tarea, evitando el over-fetching (traer datos de más) o under-fetching (traer datos de menos).   |
| **Capacidad de interacción: ↳ Reconocibilidad de adecuación** | Capacidad del producto que permite al usuario entender si el software es adecuado para sus necesidades. | Documentación descriptiva Swagger | Una documentación para el usuario que explique qué hace el sistema y que funciones tiene de forma que el usuario pueda decidir si el software cumple con sus necesidades o no es el adecuado. |
| **Capacidad de interacción:  ↳ Aprendizabilidad** 	 | Capacidad del producto que permite al usuario aprender su funcionamiento dentro de un tiempo especificado. | **Tooltips Táctica:** Interfaz Uniforme  | En los componentes visuales de interacción, como los formularios de creación (Ej: Registro de usuario HU-08, Creación de servicio HU-04).  |
| **Capacidad de interacción:  ↳ Protección contra errores de usuario** | Capacidad del sistema para prevenir errores en su operación. | ***Patrón: DTO (Data Transfer Object) Táctica:** Manejador Global de Excepciones.*  | Se aplica en la validación de entrada de todos los endpoints. Los DTOs filtran datos erróneos antes de tocar la base de datos.  El manejador global captura el error y devuelve un mensaje JSON claro y estandarizado (Ej: "Correo inválido") para que el usuario pueda corregirlo fácilmente.  |
| **Capacidad de interacción:  ↳ Involucración del usuario** | Capacidad del producto de presentar sus funciones e información de forma atractiva y motivadora, fomentando la interacción continua. | Visualización de Datos (UI/UX) e Interfaces Reactivas.  **Patrón: Observer** | Presentar los reportes contables con gráficas, tablas bien estructuradas y dashboards en lugar de datos crudos. La información es la misma pero visualmente organizada y fácil de consumir. El backend emite eventos de actualización (Observer). Esto permite que el sistema sea reactivo, respondiendo rápido a las acciones del usuario |
| **Capacidad de interacción:  ↳ Auto-descriptividad** | Capacidad de un producto para presentar la información adecuada, haciendo su uso inmediatamente evidente para el usuario sin interacciones excesivas con el producto u otros recursos | Feedback visual inmediato (Toasts, Inline Validation) y control de estados de componentes (Disabled / Loading).  Estandarización semántica de Códigos HTTP, Respuestas JSON estructuradas y Documentación. OpenAPI (Swagger). | En los componentes de interfaz de usuario, como formularios de registro (HU-08), botones de envío y notificaciones emergentes. En la capa de Controladores de la API, los manejadores globales de excepciones (Exception Filters) y la generación de Swagger.  |
| **Fiabilidad:  ↳ Ausencia de fallos** | Capacidad del sistema de llevar a cabo sus funciones sin fallos bajo condiciones normales de operación. | Manejo global de excepciones (Middleware), Validaciones preventivas  | Middleware de la aplicación y validadores de DTO.  Evita que la aplicación se caiga por datos malformados  |
| **Fiabilidad:  ↳ Disponibilidad** | Capacidad del sistema o componente de estar operativo y accesible para su uso cuando se requiere. | Health Checks (Endpoints de salud)  | Infraestructura (Docker Swarm) y API Gateway. Si un contenedor del backend cae, el balanceador redirige el tráfico a otro sano  Los health check endpoints son rutas que permiten verificar la operabilidad de la aplicación, por lo que son una muy buena herramienta para verificar que sea accesible  |
| **Fiabilidad:  ↳ Tolerancia a fallos** | Capacidad del sistema o componente para operar según lo previsto en presencia de fallos hardware o software. | Circuit BreakerTransacciones de Base de Datos (ACID).  | Conexiones a la BD y servicios externos. (Ej: HU-01 fallo de conexión).  Si la BD falla al guardar, la transacción hace Rollback automático. El sistema muestra "Intente nuevamente" en lugar de corromper datos a medias. |
| **Seguridad:   ↳ Integridad** | Capacidad de un producto para garantizar que el estado de su sistema y sus datos están protegidos frente a modificaciones o eliminaciones no autorizadas, ya sea por acciones malintencionadas o por errores informáticos. | Hashing \- Cifrado de datos hashear/cifrar los datos para corroborar posteriormente su integridad comparando no hayan sido alterados. TLS/HTTPS | Almacenamiento de contraseñas (HU-10, HU-18) y transmisión de datos en red.  La información es cifrada durante su almacenamiento y transmisión mediante protocolos seguros |
| **Seguridad:  ↳ Responsabilidad** | Capacidad de rastrear de forma inequívoca las acciones de una entidad/sujeto. | Logs de auditoria (.txt) Logs Rotation \> 30 days \> GZIP | Mediante el diseño de un archivo .txt de registro de auditoría (¿Quién hace los cambios?), registro de logs transaccionales y la inclusión sistemática de logs de rastreo en las entidades principales del sistema. |
| **Seguridad:   ↳ Autenticidad Observable** | Capacidad de un producto para demostrar que la identidad de un sujeto o recurso es la que se afirma. | **Token-Based Authentication** (JWT) | Interceptor/Middleware de autenticación en todas las rutas privadas (HU-02, HU-03, HU-17).  Es necesario tener la certeza de que un usuario logueado es quien dice ser para acceder a un recurso protegido garantizado solo a los usuarios permitidos. |
| **Seguridad:  ↳ Confidencialidad Observable** | Capacidad de asegurar que los datos solo son accesibles a aquellos con autorización para ello. | JSON Web Tokens. Hashing Algorithm Passwords: Argon2/Bcrypt   | Login (HU-10) y Rutas protegidas (HU-17).  Las contraseñas se hashean (HU-01) en reposo. El JWT valida quién es el usuario en cada petición sin consultar la BD repetitivamente, garantizando confidencialidad.  |
| **Mantenibilidad:  ↳ Reusabilidad** | Capacidad de un activo que permite que sea utilizado en más de un sistema software o en la construcción de otros activos. | Patrón Factory Method Patrón Decorator | Frontend (Botones, Modales, Tablas) y Backend (Generación de respuestas).  La tabla paginada de Clientes (HU-02), Servicios (HU-07) y Usuarios (HU-12) debe ser un único componente de UI reutilizable al que solo se le pasan datos diferentes .  |
| **Mantenibilidad:   ↳ Analizabilidad** | Facilidad con la que se puede evaluar el impacto de un determinado cambio sobre el resto del software, diagnosticar las deficiencias o causas de fallos en el software, o identificar las partes a modificar. | APM (Application Performance Monitoring ej. Prometheus/Grafana)  Pruebas de aceptación  Pruebas unitarias | En el **Stack de Infraestructura** y la capa de servicios mediante la exposición de métricas personalizadas. API y Servidores (Monitoreo en Se aplica en la capa de persistencia y controladores mediante el registro de logs, manejo estructurado de excepciones (mensajes claros de fallo) y en la cobertura de Pruebas Unitarias/Aceptación derivadas de los criterios del Backlog. |
| **Mantenibilidad:  ↳ Capacidad para ser modificado** | Capacidad del producto que permite que sea modificado de forma efectiva y eficiente sin introducir defectos o degradar su calidad. | Principios SOLID Patrón estrategia | Se aplica un **Desacoplamiento Estructural** donde los Servicios gestionan las reglas de negocio y los Repositorios encapsulan el acceso a datos. Aplicar el principio de Responsabilidad Única (SOLID) asegura que si cambia la regla de contraseñas (HU-18), solo se modifica una clase validadora y no afecta el resto del perfil del usuario.   |
| **Mantenibilidad:  ↳Capacidad para ser probado** | Facilidad con la que se pueden establecer criterios de prueba para un sistema o componente y con la que se pueden llevar a cabo las pruebas para determinar si se cumplen dichos criterios. | Pruebas Unitarias Inyección de dependencias | Capa de Lógica de Negocio  Al usar DI, podemos "burlar" (Mockear) la base de datos para probar la lógica de la HU-10 (bloqueo por 5 intentos fallidos)  |
| **Protección:  ↳ Restricción operativa** | Capacidad de un producto para limitar su funcionamiento a unos parámetros o estados seguros cuando se enfrenta a un peligro operativo. | Optimistic Locking (Bloqueo Optimista mediante campo Versión o Timestamp en BD)  **Circuit Break** | En los puntos de integración con servicios externos o bases de datos, el software se mantenga funcional y no contamine los datosSe puede implementar el **Circuit breaker** en la capa de [nest.js](http://nest.js) usando interceptores de axios**.** |
| **Protección:  ↳ Protección ante fallos** | Capacidad de un producto para ponerse automáticamente en un modo de funcionamiento seguro o para volver a una condición segura en caso de fallo. | Transacciones de base de datos  **Docker Swarm**  | Se aplica en la capa de repositorios o servicios del backend donde las operaciones atómicas se envuelven en unidades de trabajo gestionadas por el ORM En caso de comprometer la base de datos o que este servicio presente un fallo el **Auto reset de DockerSwarm** puede crear un nuevo estado funcional. Por ejemplo, al registrar un cliente (HU-01) o editar un servicio (HU-08), la transacción engloba todas las inserciones. Si ocurre un fallo de conexión a la mitad del proceso, el sistema ejecuta un **Rollback automático** |
| **Protección:   ↳ Advertencia de peligro** | Capacidad de un producto para alertar de riesgos inaceptables, de modo que puedan reaccionar con tiempo suficiente para mantener la seguridad de las operaciones. | Webhooks Patrón Observer Filtros de Excepciones Globales | **Filtros de Excepciones Globales** (Global Exception Filters): Implementados sobre el framework **NestJS**, actúan como una capa de interceptación única que captura cualquier error no controlado en el ciclo de vida de la petición. **SDK de Sentry** (Error Tracking): Integrado directamente en los filtros globales para el reporte automático de excepciones, permitiendo la trazabilidad completa del error  y el contexto del entorno en tiempo real. El patrón **Observer** "escucha" eventos críticos en segundo plano. Si detecta un umbral de riesgo (por ejemplo, múltiples bloqueos de cuenta por intentos fallidos en la HU-10, o repetidos fallos de conexión a BD en la HU-01), dispara un **Webhook** que envía una alerta inmediata  |

| Atributos de Calidad “No observables” |  |  |  |
| ----- | ----- | ----- | ----- |
| **Atributo** | **Descripción** | **Tácticas /Patrón de Arquitectura** | **Dónde se aplica** |
| **Eficiencia de desempeño**:  ↳ Comportamiento temporal. |  Grado en que un producto realiza sus funciones de forma que el tiempo de respuesta y el ratio de rendimiento cumple los requisitos especificados.  |  Pruebas de rendimiento (load testing) |  Capa de acceso a datos — estableciendo umbrales máximos de latencia por endpoint. |
| **Eficiencia de desempeño:   ↳ Utilización de recursos.** |  Capacidad del sistema para ejecutar sus funciones sin exceder los límites de memoria, CPU y red especificados bajo condiciones de carga. | Redis (caché)  Paginación en BD Docker Swarm | Se aplica en módulos que gestionan objetos masivos y repetitivos optimizando el uso de la memoria principal (RAM) al eliminar datos redundantes, como las consultas de listados (HU-02 clientes, HU-07 servicios). Docker Swarm distribuye las 500 peticiones concurrentes entre varios contenedores. Buen rendimiento del servidor. |
| **Compatibilidad:  ↳ Coexistencia** | Capacidad del producto para coexistir con otro software independiente, en un entorno común, compartiendo recursos comunes sin detrimento. | Utilización de contenedores por cada lado (BDD, FE y BE) |  |
| **Compatibilidad  ↳ Interoperabilidad** | Capacidad de dos o más sistemas o componentes para intercambiar información y utilizar la información intercambiada. | (API REST) Si el módulo contable necesita datos de los clientes, consumirá al microservicio | Capa de controladores (Endpoints expuestos) |
| **Capacidad de interacción:  ↳ Operabilidad** | Capacidad del producto que permite al usuario operarlo y controlarlo con facilidad. | Patrón: Command y Backend for Frontend | Se aplica en la ejecución de acciones críticas que cambian el estado, como inactivar un cliente o reactivar un servicio.  La operabilidad se garantiza a través del diseño de navegación y flujos de la interfaz, apoyado por el Patrón BFF que organiza las respuestas para el frontend. |
| **Fiabilidad:  ↳ Capacidad de recuperación** | Capacidad del producto software para recuperar los datos directamente afectados y reestablecer el estado deseado del sistema en caso de interrupción o fallo. | Backups automatizados (Snapshots), Replicación de Base de Datos (Master-Slave)  | Servidor de Base de Datos y volúmenes de Docker. Ya que operamos con datos de una empresa y sus clientes es necesario tener mecanismos como “backups” en los que recurrir en caso de una corrupción de datos, etc.  |
| **Seguridad:   ↳ Resistencia** | Capacidad de mantener la operación de un producto bajo condiciones de ataque de un actor malicioso. | **Rate limiting \-** técnica para la tolerancia a fallos de req multiples. Limiting API Gateway | Endpoints públicos (Login HU-10) y API Gateway.  La HU-10 exige bloquear tras 5 intentos. El Rate Limiting a nivel de API Gateway/Nginx previene ataques de fuerza bruta antes de que lleguen siquiera al código de la aplicación.  |
| **Mantenibilidad:   ↳ Modularidad** | Capacidad de un producto para evitar que los cambios en un componente afecten a otros componentes. | Arquitectura Multicapa Inyección de dependencias | En todo el Backend (separando Controladores, Servicios y Repositorios). Permite que si cambias la base de datos (de MySQL a PostgreSQL), solo cambies la capa de Repositorio, sin tocar la lógica de negocio de las HU. |
| **Flexibilidad: Adaptabilidad** | Capacidad del producto que le permite ser adaptado de forma efectiva y eficiente a diferentes entornos determinados de hardware, software, operacionales o de uso.  | Contenedores de Docker  Responsive Design | Al utilizar servicios de contenedores a través de contenedores, esto permite que la aplicación pueda ser portable y ser ejecutable en diferentes entornos determinados. |
| **Flexibilidad: Reemplazabilidad** | Capacidad del producto para ser utilizado en lugar de otro producto software determinado con el mismo propósito y en el mismo entorno.  | Arquitectura con API Gateway Contenedorización (Docker) y Contratos de API estandarizados (REST).  | En la capa de Infraestructura de despliegue (Docker Swarm) y en la comunicación de red entre el API Gateway, el BFF y el microservicio Dentro de contenedores Docker independientes, el sistema adquiere una reemplazabilidad absoluta a nivel de componentes grandes (cajas negras). Si en un futuro la empresa decide que el microservicio de Parametrización ya no debe estar en NestJS, sino que deciden reescribir desde cero en otro lenguaje, simplemente "apagan" el contenedor y encienden el nuevo contenedor  |
| **Flexibilidad:  ↳ Escalabilidad** | Capacidad del producto para gestionar cargas de trabajo crecientes o decrecientes y para adaptar su capacidad a la variabilidad. | Clustering Contenedores, Docker Swarm / Kubernetes |  Infraestructura de despliegue.  Permite que Docker Swarm levante 5 copias del backend si hay muchos usuarios, y cualquiera puede atender la petición.  |
| **Flexibilidad:  ↳ Instalabilidad** | Facilidad con la que el producto se puede instalar y/o desinstalar de forma exitosa en un determinado entorno. | Docker/contenedores |  |
| **Protección:  ↳ Integración segura** | Capacidad de un producto para mantener la seguridad durante y después de la integración con uno o varios componentes. | API Gateway con control centralizado de seguridad Validación estricita de JWT Políticas CORS | Se manifiesta en la infraestructura de despliegue. El API Gateway actúa como única puerta de entrada. Intercepta todas las solicitudes, verifica la validez del JWT (HU-10) y aplica políticas de origen (CORS) antes de redirigirlas al backend  |

9. **Vista Física**

![][image1]

10. **Vista Funcional o Lógica**

\[Se describe la descomposición del sistema dentro de procesos y grupos de procesos. Se debe organizar la sección por grupos de procesos donde se reflejen sus comunicaciones o interacciones. Describa primero los principales modos de comunicación entre procesos, tales como: pases de mensajes, etc. Para cada red de procesos se debe incluir una subsección con la siguiente información:  
Su nombre.  
Los procesos involucrados.  
Las interacciones entre los procesos en la forma de diagramas de colaboración, en los cuales los objetos son los procesos reales que completan su propio vínculo de control. Para cada proceso, describa brevemente su comportamiento, su ciclo de vida y sus características de comunicación.\]

Aunque tradicionalmente se utilizan diagramas de secuencia o de colaboración para esta representación, también puede representarse de manera genérica mediante un diagrama de manifestación el cual cumple como objetivo mostrar la relación de dependencia entre los distintos componentes del sistema sin llegar a mostrar la vista completa de despliegue. \]  **\[Vista opcional dependiendo de las necesidades a resolver y la perspectiva del cliente\]**

11. **Vista de Despliegue** 

\[Se describe una o más configuraciones de redes físicas (hardware) sobre las cuales el software será desarrollado. Para cada configuración, se debe indicar los nodos físicos (computadores, CPUs) que ejecutan el software, y sus interconexiones (bus, LAN, punto a punto, etc.). También se incluye un mapa de los procesos de la vista de procesos, dentro de los nodos físicos. Para cada configuración física de red incluya una subsección con la siguiente información:  
Su nombre.  
Un diagrama de entrega que ilustre la configuración, seguida por un mapa de procesos para cada procesador.\]

Puede representarse mediante el siguiente artefacto: Diagrama de despliegue.  
\[**Vista opcional dependiendo de las necesidades a resolver y la perspectiva del cliente\]**

---

**Atributos de calidad no implementados \- Justificación:**

**Eficiencia de desempeño \- Capacidad:** Este atributo hace referencia a concurrencia de usuarios, en nuestro contexto realmente quien usara nuestro producto a desarrollar es de una empresa (uso interno), generalmente dentro de la organización se asignan personas a utilizar el aplicativo, no es un software al cual vayan a ingresar demasiadas personas y de hecho rara vez de forma concurrente (por lo cual se define que no es necesario y en el futuro tampoco está la posibilidad de un crecimiento desmedido de ingreso concurrente de usuarios al mismo tiempo). 

**Capacidad de interacción \- Inclusividad:** No es muy necesario ya que el software tiene un carácter mucho más empresarial por esto mismo es suficiente referirse al usuario de una forma más neutral.(No es para usuarios públicos donde se tenga que tener en cuenta todas sus particularidades)

**Capacidad de interacción \- Asistencia al usuario**: No es muy necesario implementar accesibilidad puesto que la app no tiene un componente muy grande para clientes de cara al público .

**Protección \- Identificación de riesgos:** La aplicación no ocupa un rol donde alguna de las situaciones descritas en el atributo apliquen.

**Seguridad \- No Repudio:** tenemos presente que el no repudio es poder dejar establecido que alguien es quien ha hecho “X” acción, para este caso se manejara desde el lado de responsabilidad, que en esencia englobará los Logs/registros de auditoría necesarios para tener siempre un registro de cada usuario x que hace una acción y eventos llevados a cabo.

