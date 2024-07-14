import axios from "axios";

// @ts-ignore
export const GIT_COMMIT: string = __GIT_COMMIT;

export var BACKEND_VERSION: string = "UNKNOWN";

let fetcher: any;

fetcher = setInterval(() => {
  axios.get('/api/system/version')
    .then(result => {
      if (result.status != 200) return
      //console.log(result.data.data)
      BACKEND_VERSION = result.data.data.backend;


      clearInterval(fetcher)
    })
    .catch(() => {
    })
}, 1000);
