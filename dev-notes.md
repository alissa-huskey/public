Dev Notes
=========

Static html pages are generated using [Jupyter Book][] and published on
[Github Pages][] via [Github Actions][].

[Jupyter Book]: https://jupyterbook.org/
[Github Pages]: https://pages.github.com/
[Github Actions]: https://github.com/features/actions

tl;dr
-----

1. Public docs are in [docs/](docs) and written in markdown. New pages must be
   added to [](docs/_toc.yml).
2. Use `./tools/build` to build.
4. Use `./tools/serve` to start a local server.
6. View local changes at: http://localhost:1314

Build
-----

### Prerequisites

* Poetry
* Python 3.9+

### Details

To run a local build first use poetry to install dependencies and start a
shell.

Generate static pages and run a web server, using the bash scripts in the
`tools` directory. Alternately the simple version is:

```bash
# generate the static files
jupyter-book build docs

# start a HTTP server at http://localhost:1314
python -m http.server --directory docs/_build/html
```

Deploy
------

Content is deployed via a [Github Pages Action][] that is triggered whenever a
commit is made to the main branch that touches the `docs/` folder or the
github action yml file.

When the job runs, a production `requirements.txt` file is exported using
poetry which is installed via `pip`. The HTML is then generated using the
`jupyter-book` executable and committed to a `gh-pages` branch.

The content of this branch is served on the github pages site.

[Github Pages Action]: https://github.com/peaceiris/actions-gh-pages

### Setup

Most of the setup is done in the [](.github/workflows/docs.yml) config file.

Additionally, a deploy key was created and added to the repository ([more
info][deploy-key]), and the following repo settings are saved on the github web
interface.

* Pages:
  * Branch: `gh-pages`
  * Folder: `/ (root)`
* Secrets > Actions > Repository Secrets
  * name: `ACTIONS_PAGES_DEPLOY_KEY`
  * value: contents of `gh-pages` file
* Deploy Key
  * name: `Public Key of ACTIONS_PAGES_DEPLOY_KEY`
  * value: contents of `gh-pages.pub` file

[deploy-key]: https://github.com/peaceiris/actions-gh-pages#%EF%B8%8F-create-ssh-deploy-key
