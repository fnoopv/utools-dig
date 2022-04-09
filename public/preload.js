const { Resolver } = require("dns").promises;

window.query = async (values) => {
  const addresses = {
    "msg": "",
    "data": []
  };

  const resolverOption = {
    timeout: 5,
    tries: 3,
  };

  const resolver = new Resolver(resolverOption);
  resolver.setServers([values.dns]);

  await resolver.resolve(values.domain, values.type).then(
    (res) => {
      for (const value of res) {
        addresses.data.push({ domain: values.domain, type: values.type, result: value })
      }
    },
    (err) => {
      const errMsg = checkError(err);
      addresses.msg = errMsg;
    }
  );
  return addresses;
};

function checkError(err) {
  switch (err.code) {
    case "ENODATA":
      return "没有相关解析记录";
    case "ETIMEOUT":
      return "连接DNS服务器超时,请重试";
    case "ENOTFOUND":
      return "未知域名,请检查域名有效性";
    default:
      return err.code;
  }
}