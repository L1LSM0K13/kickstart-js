# Kickstart-js

**Kickstart-js** is a command-line utility that helps you scaffold an entire project quickly and efficiently. It supports various frontend frameworks, CSS libraries, linters, backend frameworks, view engines, and databases. With **Kickstart-js**, you can streamline your project setup and get started with development right away.

## Features

- **Frontend Frameworks**: Vanilla, React, Svelte, Vue, Preact, Lit
- **CSS Frameworks**: Vanilla, Sass, Less, TailwindCSS
- **Linters**: ESLint, Prettier, Stylelint, No Linter
- **Backends**: ExpressJS, KoaJS, No backend
- **View Engines**: EJS, Pug (Jade), Dust, Handlebars, HoganJS, Twig, Vash, No view engine
- **Databases**: Postgres, SQLite, MySQL, MongoDB (Mongoose), OracleDB, No Database

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/kickstart-js.git
   cd kickstart-js

2. Install dependencies:
    ```bash
    npm install

## Usage

1. Run the build command:
    ```bash
    npm run build

2. Follow the prompts to configure your project. You will be asked to provide:
   ```bash 
    Project name
    Whether to use Vite
    Frontend framework
    CSS framework
    Linter
    Backend framework
    View engine (if applicable)
    Database (if applicable)

If you choose Vite, a new folder with the project name will be created inside your current directory. If you do not choose Vite, everything will be set up in the current directory.

Once the project is set up you can remove the dependencies and the build.js file.
