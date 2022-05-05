export default {


    async download(files){
        await Promise.all(
          [
            "sebhastian.com/img/default.png",
            "sebhastian.com/img/nathan-sebhastian.png",
          ].map((url) => download(url, "dist"))
        );
    }
}
