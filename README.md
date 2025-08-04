# Cancion Worker

> [!IMPORTANT]
> Este proyecto requiere acceso a SunoAi y configuración previa de credenciales para funcionar correctamente. Consulta la documentación interna antes de desplegar en producción.

Servicio alojado en Cloudflare Workers que genera una cancion de cumpleaños utilizando SunoAi.

## Tabla de Contenidos
# Cancion Worker

Servicio alojado en Cloudflare Workers que genera una cancion de cumpleaños utilizando SunoAi.

## Tabla de Contenidos

- [Get Started](#get-started)
- [Uso](#uso)
- [Características](#características)
- [Contribución](#contribución)
- [Licencia](#licencia)
- [Contacto](#contacto)

## Get Started

```bash
# Clona el repositorio
git clone https://github.com/TuUsuario/cancion-worker.git
cd cancion-worker
```
### Desarrollo
Puedes instalar las dependencias y comenzar a desarrollar directamente con wrangler en tu
maquina local

```bash
# Instala dependencias 
npm install
# Inicia servidor de desarrollo
npx wrangler dev
```

La otra opcion es utilizar docker, con los servicios que ya vienen definidos dentro del repositorio
en el archivo docker-compose.yml

```bash
# Inicia servidor de desarrollo
docker-compose up dev
```


## Uso

```bash
# Inicia el servicio
npm start
```

El servicio expone endpoints REST para crear, consultar y actualizar información de canciones.

## Características

- API REST para gestión de canciones (crear, leer, actualizar, eliminar)
- Validación de datos de entrada
- Persistencia en base de datos (configurable)
- Registro de logs de operaciones
- Estructura modular y escalable

## Contribución

Las contribuciones son bienvenidas. Por favor, sigue las [guías de contribución](CONTRIBUTING.md).

## Licencia

Este proyecto está bajo la licencia MIT.

## Contacto

- Autor: Álvaro Abarca Godoy
- GitHub: [AlvaroAbarcaGodoy](https://github.com/AlvaroAbarcaGodoy)
- Email: [alvaro.abarca.godoy@gmail.com](mailto:alvaro.abarca.godoy@gmail.com)