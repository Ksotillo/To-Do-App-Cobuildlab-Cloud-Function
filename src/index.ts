import * as functions from "firebase-functions";
import { GraphQLClient } from "graphql-request";

const endpoint = functions.config().db.endpoint;
const apiToken = functions.config().db.token;

const client = new GraphQLClient(endpoint!, {
    headers: {
        authorization: `Bearer ${apiToken!}`,
    },
});



export const updateTaskStatus = functions.https.onRequest(async (request, response): Promise<any> => {
    try {
        const { id, status, email } = JSON.parse(request.body);
        const UPDATE_TASK_STATUS = `
        mutation {
            taskUpdate(
                data: {
                    id: "${id}",
                    status: "${status}",
                    user: {
                    connect: {
                        email: "${email}"
                    }
                }
            }) {
                content,
                status
            }
        }
        `;

        let result = await client.request(UPDATE_TASK_STATUS);
        response.set("Access-Control-Allow-Origin", "*");
        if (request.method === "OPTIONS") {
            /* handle preflight OPTIONS request */

            response.set("Access-Control-Allow-Methods", "POST");
            response.set("Access-Control-Allow-Headers", "Content-Type");

            // cache preflight response for 3600 sec
            response.set("Access-Control-Max-Age", "3600");

            return response.sendStatus(204);
        }

        return response.status(200).json(result);
    } catch (error) {
        console.log(error);
        return response.status(500).json({ message: "Internal server error" });
        // throw error;
    }
});
