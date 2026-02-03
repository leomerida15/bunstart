esta herramiente sera una CLI que ayudara a iniciar proyecto y administrar monorepos, que comandos tendra. todos sus comandos y mensajes seran en ingles



init: creara la base de codigo para protyectos como.
- mono repo.
  > crear apps: base de codigo para una app.
  > crear packages: base de codigo para un package,
  > crear CLI.
  > crear lib.
  > instalar paquetes.
- API REST.
- FRONT con react.
- librerias.

mono: para monorepos 
  > {appName|libName}
  |- ** tendra todos los comandos de bun para manejar paquetes pero sobre el paquete o app seleccionada en el comando previo.
  
  |- start && dev && build: dispara el comadno start en el paquete o app seleccionada en el comando previo.

  > generate, gen: crear una app o paquete en mi monorepo, configura lo necesario en el package JSON con su name pos nombre del mono @mononame/{appName|libName}.

  |- app: crear una app en mi monorepo, configura lo necesario en el package JSON con su name pos nombre del mono @mononame/{appName|libName}.

  |- pkg: crear un paquete en mi monorepo, configura lo necesario en el package JSON con su name pos nombre del mono @mononame/{appName|libName}.

