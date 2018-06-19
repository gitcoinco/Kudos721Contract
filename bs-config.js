module.exports = {
    port: process.env.PORT | 3000,
    server: {
    	baseDir: ["./src", "./build/contracts"]
    }
};