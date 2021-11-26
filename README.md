<!-- ABOUT THE PROJECT -->
## About The Project
...
<p align="right">(<a href="#top">back to top</a>)</p>

### Prerequisites

Make sure you have installed all of the following prerequisites on your development machine:
* Node >= 10
* Redis
* Mongodb
### Installation

_If you wish to run the tutorial, you can use the following commands_

1. Clone the repo
   ```sh
   git clone https://github.com/your_username_/Project-Name.git
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Copy `.env-sample` to `.env` and Edit your variables by your setting
   ```js
   MONGODB_URL='ENTER MONGODB URL';
   REDIS_HOST='ENTER REDIS HOST';
   REDIS_PORT='ENTER REDIS PORT';
   ...
   ```

<p align="right">(<a href="#top">back to top</a>)</p>


<!-- USAGE EXAMPLES -->
## Usage

Use this space to show useful examples of how a project can be used. Additional screenshots, code examples and demos work well in this space. You may also link to more resources.

_For more examples, please refer to the [Documentation](https://example.com)_

<p align="right">(<a href="#top">back to top</a>)</p>



## Usage
Available methods:
- [Function and Constanst](#FunctionandConstanst): Retrieves the Function/Constanst of an application.

### Function and Constanst

Retrieves the full detail of an application. Options:

* `appId`: the Google Play id of the application (the `?id=` parameter on the url).
* `lang` (optional, defaults to `'en'`): the two letter language code in which to fetch the app page.
* `country` (optional, defaults to `'us'`): the two letter country code used to retrieve the applications. Needed when the app is available only in some countries.

Command:

```sh
npm run getAppInfo
```
