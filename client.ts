import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";
import { ProtoGrpcType } from "./proto/random";
import { deadlineToString } from "@grpc/grpc-js/build/src/deadline";

const port = 8082;


const packageDef = protoLoader.loadSync(
  path.resolve(__dirname, "./proto/random.proto")
);

const grpcObj = grpc.loadPackageDefinition(
  packageDef
) as unknown as ProtoGrpcType;



const client = new grpcObj.randomPackage.Random(
  `0.0.0.0:${port}`,
  grpc.credentials.createInsecure()
);

const deadline = new Date();

deadline.setSeconds(deadline.getSeconds() + 5);

client.waitForReady(deadline, (err) => {
  if (err) {
    console.error(err);
    return;
  }

  onClientReady();
});

function onClientReady() {
  // client.PingPong({ message: "shift" }, (err, result) => {
  //   if (err) {
  //     console.error(err);
  //     return;
  //   }

  //   console.log(result);
  // });

  const stream = client.RandomNumbers({ maxVal: 85 });
  stream.on("data", (chunk) => {
    console.log(chunk, "here is the value");
  });

  stream.on("end", () => {
    console.log("communication ended");
  });
}
