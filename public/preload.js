const { Resolver } = require("dns").promises;

window.query = async (values) => {
  const addresses = [];

  const resolverOption = {
    timeout: 5,
    tries: 3,
  };

  const resolver = new Resolver(resolverOption);
  resolver.setServers([values.dns]);

  await resolver.resolve(values.domain, values.type).then(
    (res) => {
      for (const value of res) {
        addresses.push({domain: values.domain, type: values.type, result: value})
      }
      console.log("resss: ", res);
    },
    (err) => {
      console.log("err: ", err);
    }
  );
  console.log("result: ", addresses);
  return addresses;
};
