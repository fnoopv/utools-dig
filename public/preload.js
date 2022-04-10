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
    case "ESERVFAIL":
      return "DNS服务器故障, 请更换服务器重试";
    case "EREFUSED":
      return "服务器拒绝请求, 请更换服务器重试";
    case "EBADNAME":
      return "主机名格式错误, 请检查主机名";
    case "EBADRESP":
      return "服务器响应错误, 请稍后重试";
    case "ECONNREFUSED":
      return "连接服务器失败, 请稍后重试";
    default:
      return err.code;
  }
}