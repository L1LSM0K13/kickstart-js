import { exec } from "child_process";
import inquirer from "inquirer";
import chalk from "chalk";
import * as util from "node:util";
import * as fs from "node:fs";
import * as path from "node:path";

const execPromise = util.promisify(exec);

async function main() {

  const options = await inquirer.prompt([
      {
        type: "input",
        name: "project-name",
        message: "Name your project:",
        validate: (input) => input !== "" || "Project name cannot be empty",
      },
      {
        type: "confirm",
        name: "vite",
        message: "Will you be using Vite?",
      },
      {
        type: "list",
        name: "framework",
        message: "Select frontend framework",
        choices: ["Vanilla", "React", "Svelte", "Vue", "Preact", "Lit"],
        when: (answers) => answers.vite,
      },
      {
        type: "list",
        name: "cssFramework",
        message: "Choose your CSS:",
        choices: ["Vanilla", "Sass", "Less", "TailwindCSS"],
      },
      {
        type: "list",
        name: "linter",
        message: "Select linter",
        choices: ["ESLint", "Prettier", "Stylelint", "No Linter"],
      },
      {
        type: "list",
        name: "backend",
        message: "Choose your backend",
        choices: ["ExpressJS", "KoaJS", "No backend"],
      },
      {
        type: "list",
        name: "view-engine",
        message: "Choose your view engine",
        choices: [
          "EJS",
          "Pug (Jade)",
          "Dust",
          "Handlebars",
          "HoganJS",
          "Twig",
          "Vash",
          "No view engine",
        ],
        when: (answers) =>
            answers.backend !== "No backend" || answers.framework === "Vanilla",
      },
      {
        type: "list",
        name: "database",
        message: "Choose a database (JS only)",
        choices: [
          "pg (Postgres)",
          "sqlite v3",
          "mysql",
          "Mongoose (MongoDB)",
          "OracleDB",
          "No Database",
        ],
        when: (answers) => answers.backend !== "No backend",
      },
    ]);
  const summary = `
      ${chalk.whiteBright("Project Name:")} ${options["project-name"]}
      ${chalk.yellow("Vite:")} ${options.vite ? chalk.green("Yes") : chalk.red("No")}
      ${chalk.magenta("Framework:")} ${options.framework || chalk.gray("N/A")}
      ${chalk.redBright("CSS Framework:")} ${options["cssFramework"]}
      ${chalk.magentaBright("Linter:")} ${options.linter}
      ${chalk.greenBright("Backend:")} ${options.backend}
      ${chalk.cyan("View Engine:")} ${options["view-engine"] || chalk.gray("N/A")}
      ${chalk.blue("Database:")} ${options.database || chalk.gray("N/A")}`;
  const confirm = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: `${chalk.yellow("Please review your selections:")}\n${summary}\n${chalk.yellow("Is this correct?")}`,
      },
    ]);

  const tailwindConfigData = '/** @type {import(\'tailwindcss\').Config} */\n' + 'module.exports = {\n' + '  content: ["./public/css/**/*.{html,js}"],\n' + '  theme: {\n' + '    extend: {},\n' + '  },\n' + '  plugins: [],\n' + '}'
  const tailwindInputContent = '@tailwind base;\n@tailwind components;\n@tailwind utilities;'
  const tailwindNpxCommand = 'npx tailwindcss -i ./public/css/input.css -o ./public/css/output.css --watch'

  async function build(options) {
    const projectName = options["project-name"];
    const dirPath = path.resolve(process.cwd(), projectName)

    async function initNoVite() {
      async function mkPublic() {

        const directories = [
          'public/css',
          'public/views',
          'public/images',
          'public/javascript'
        ];

        for (const dir of directories) {
          const fullPath = path.resolve(dir)
          fs.mkdirSync(fullPath, {recursive: true})
        }
      }
      async function mkSrc() {

        const directories = [
          'src/controllers',
          'src/routes',
          'src/models',
          'config',
        ];

        for (const dir of directories) {
          const fullPath = path.resolve(dir)
          fs.mkdirSync(fullPath, {recursive: true})
        }
        fs.writeFileSync('config/.env', '')
      }

      // Handle non-Vite project setup
      fs.mkdir(dirPath, {recursive: true}, async (err) => {
        if (err) {
          console.error("Error creating directory:", err)
        } else {
          process.chdir(projectName)
          await execPromise('npm init -y')
          fs.writeFileSync('app.js', '')
          await mkPublic()
          // Handle CSS framework
          switch (options.cssFramework) {
            case "TailwindCSS":
              await execPromise('npm install -D tailwindcss');
              await execPromise('npx tailwindcss init')

                fs.writeFileSync('tailwind.config.js', tailwindConfigData)
                fs.writeFileSync('public/css/input.css', tailwindInputContent)

              console.log(`TAILWINDCSS when done: run ${tailwindNpxCommand}`)
              break;
            case "Sass":
              await execPromise("npm install sass");
              break;
            case "Less":
              await execPromise("npm install less");
              break;
            case "Vanilla":
              break;
          }

          // Handle linter
          switch (options.linter) {
            case "ESLint":
              await execPromise("yes 2 | npm init @eslint/config@latest");

              console.log(`ESLINT when done: run <npx eslint yourfile.js>`)
              break;
            case "Prettier":
              await execPromise("npm install --save-dev --save-exact prettier");
              await execPromise(`node --eval "fs.writeFileSync('.prettierrc','{}')"`)
              await execPromise(`node --eval "fs.writeFileSync('.prettierignore','# Ignore artifacts:build coverage')"`)

              console.log(`PRETTIER when done: run <npx prettier --check> to format your files`)
              break;
            case "Stylelint":
              await execPromise("npm install stylelint stylelint-scss");
              break;
            case "No Linter":
              break;
          }

          // Handle backend
          switch (options.backend) {
            case "ExpressJS":
              await execPromise("npm install nodemon express express-session express-flash body-parser dotenv");
              await mkSrc()
              break;
            case "KoaJS":
              await execPromise("npm install koa @koa/router koa-bodyparser dotenv koa-logger koa-static koa-helmet koa-onerror");
              await mkSrc()
              break;
            case "No backend":
              break;
          }

          // Handle view engine
          switch (options["view-engine"]) {
            case "EJS":
              await execPromise("npm install ejs");
              break;
            case "Pug (Jade)":
              await execPromise("npm install pug");
              break;
            case "Dust":
              await execPromise("npm install dustjs-linkedin");
              break;
            case "Handlebars":
              await execPromise("npm install handlebars");
              break;
            case "HoganJS":
              await execPromise("npm install hogan.js");
              break;
            case "Twig":
              await execPromise("npm install twig");
              break;
            case "Vash":
              await execPromise("npm install vash");
              break;
            case "No view engine":
              break;
          }

          // Handle database
          switch (options.database) {
            case "pg (Postgres)":
              await execPromise("npm install pg");
              break;
            case "sqlite v3":
              await execPromise("npm install sqlite3");
              break;
            case "mysql":
              await execPromise("npm install mysql");
              break;
            case "Mongoose (MongoDB)":
              await execPromise("npm install mongoose");
              break;
            case "OracleDB":
              await execPromise("npm install oracledb");
              break;
            case "No Database":
              break;
          }
        }
      })
    }
    async function initVite() {
      // Handles proper framework
      switch (options.framework) {
        case "Vanilla":
          await execPromise(
              `npm create vite@latest ${projectName} -- --template vanilla`,
          );
          break;
        case "React":
          await execPromise(
              `npm create vite@latest ${projectName} -- --template react`,
          );
          break;
        case "Svelte":
          await execPromise(
              `npm create vite@latest ${projectName} -- --template svelte`,
          );
          break;
        case "Vue":
          await execPromise(
              `npm create vite@latest ${projectName} -- --template vue`,
          );
          break;
        case "Preact":
          await execPromise(
              `npm create vite@latest ${projectName} -- --template preact`,
          );
          break;
        case "Lit":
          await execPromise(
              `npm create vite@latest ${projectName} -- --template lit`,
          );
          break;
      }

      // Handle CSS framework
      switch (options.cssFramework) {
        case "TailwindCSS":

          await execPromise(`cd ${projectName} && npm install tailwindcss`);
          break;
        case "Sass":
          await execPromise(`cd ${projectName} && npm install sass`);
          break;
        case "Less":
          await execPromise(`cd ${projectName} && npm install less`);
          break;
        case "Vanilla":
          // No additional installation required for Vanilla CSS
          break;
      }

      // Handle linter
      switch (options.linter) {
        case "ESLint":
          await execPromise(`cd ${projectName} && npm install eslint`);
          break;
        case "Prettier":
          await execPromise(`cd ${projectName} && npm install prettier`);
          break;
        case "Stylelint":
          await execPromise(`cd ${projectName} && npm install stylelint`);
          break;
        case "No Linter":
          // No linter to install
          break;
      }

      // Handle backend
      switch (options.backend) {
        case "ExpressJS":
          await execPromise(`cd ${projectName} && npm install express`);
          break;
        case "KoaJS":
          await execPromise(`cd ${projectName} && npm install koa`);
          break;
        case "No backend":
          // No backend to install
          break;
      }

      // Handle view engine
      switch (options["view-engine"]) {
        case "EJS":
          await execPromise(`cd ${projectName} && npm install ejs`);
          break;
        case "Pug (Jade)":
          await execPromise(`cd ${projectName} && npm install pug`);
          break;
        case "Dust":
          await execPromise(`cd ${projectName} && npm install dustjs-linkedin`);
          break;
        case "Handlebars":
          await execPromise(`cd ${projectName} && npm install handlebars`);
          break;
        case "HoganJS":
          await execPromise(`cd ${projectName} && npm install hogan.js`);
          break;
        case "Twig":
          await execPromise(`cd ${projectName} && npm install twig`);
          break;
        case "Vash":
          await execPromise(`cd ${projectName} && npm install vash`);
          break;
        case "No view engine":
          // No view engine to install
          break;
      }

      // Handle database
      switch (options.database) {
        case "pg (Postgres)":
          await execPromise(`cd ${projectName} && npm install pg`);
          break;
        case "sqlite v3":
          await execPromise(`cd ${projectName} && npm install sqlite3`);
          break;
        case "mysql":
          await execPromise(`cd ${projectName} && npm install mysql`);
          break;
        case "Mongoose (MongoDB)":
          await execPromise(`cd ${projectName} && npm install mongoose`);
          break;
        case "OracleDB":
          await execPromise(`cd ${projectName} && npm install oracledb`);
          break;
        case "No Database":
          // No database to install
          break;
      }
    }

    // builds depending if using vite or not
    if (options.vite) {
      await initVite()
    } else {
      await initNoVite()
    }
  }

  try {
    if (confirm.confirm) {
      console.log(chalk.yellowBright("Configuration confirmed. Building..."));
      await build(options)
    } else {
      console.log(chalk.red("Cancelling..."));
      process.exit(0);
    }
  } catch (err) {
    console.log(err);
  }
}
main();