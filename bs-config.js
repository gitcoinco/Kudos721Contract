module.exports = {
    port: parseInt(process.env.PORT, 10) || 3000,
    server: {
    	baseDir: ["./src", "./build/contracts"]
    }
};