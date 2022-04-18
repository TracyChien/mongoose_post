const { headers } = require("./headers");

function errHandle(res, error) {
  res.writeHead(400, headers);
  res.write(
    JSON.stringify({
      status: "false",
      message: "欄位錯誤，或 無此ID",
      errors: error,
    })
  );
  res.end();
}

module.exports = errHandle;
