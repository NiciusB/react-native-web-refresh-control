module.exports = {
    "env": {
        "es6": true,
        "node": false
    },
    "extends": [
        "universe/native",
        "plugin:react/recommended",
        "prettier"
    ],
    "plugins": [
      "react-hooks",
      "prettier"
    ],
    "rules": {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "prettier/prettier": "error"
    },
    "settings": {
        "react": {
            "version": "detect"
        }
    }
};