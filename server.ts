import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

// Type definition from the proto loader
import { ProtoGrpcType } from "./proto/random";

import { RandomHandlers } from "./proto/randomPackage/Random";

const port = 8082;
const proto_file = "./proto/random.proto";

// load our proto file with proto loader
const packageDef = protoLoader.loadSync(path.resolve(__dirname, proto_file));

// create grpc object

const grpcObj = grpc.loadPackageDefinition(
  packageDef
) as unknown as ProtoGrpcType;

// pull out our package

const randomPackage = grpcObj.randomPackage;

// creaee a function

function main() {
  const server = getServer();

  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error(err);
        return;
      }

      console.log(`Your server has started on port ${port} `);
    }
  );
}

function getServer() {
  // create grpc server
  const server = new grpc.Server();

  server.addService(randomPackage.Random.service, {
    // UNARY
    PingPong: (req, res) => {
      console.log(req.request);
      res(null, { message: "pant" });
    },
    RandomNumbers: (call) => {
      const { maxVal = 10 } = call.request;

      call.write({ num: Math.floor(Math.random() * maxVal) });
      call.end();
    },
  } as RandomHandlers);

  return server;
}

main();
