const getNamedAccounts = require("hardhat-deploy").getNamedAccounts

// function deployFunction2 () {
//     console.log("Hi!")
// }
// module.exports.default = deployFunction2

module.exports = async ({getNamedAccounts, deployments}) => {
    // 从getNamedAccounts 获取第一个账户的地址，命名为deployer
    const firstAccount = (await getNamedAccounts()).firstAccount
    console.log("Deploying FundMe with the account:", firstAccount)
    
    // 从deployments对象中获取deploy函数
    const { deploy } = deployments
    // 调用deploy函数部署合约，传入合约名称和部署参数
    await deploy("FundMe", {
        from: firstAccount,
        args: [600], // 构造函数参数，目标锁定期为10分钟
        log: true
    })
}

module.exports.tags = ["all", "fundMe"]