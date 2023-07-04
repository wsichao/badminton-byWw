

module.exports = {
    /**
     * 处理 async await 抛错
     */
    awaitWrap(promise) {
        return promise
            .then(data => [null, data])
            .catch(err => [err, null])
    }
}
