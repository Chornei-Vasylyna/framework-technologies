import { studentRepository } from "#repositories/student.repository.js";
import { eventBus } from "#utils/eventBus.js";
import { withImageUrl } from "#utils/studentDetails.js";

const clients = new Set();
let eventsBound = false;

const sendJson = (socket, payload) => {
  if (socket.readyState !== 1) {
    return;
  }

  socket.send(JSON.stringify(payload));
};

const broadcast = (payload) => {
  for (const client of clients) {
    sendJson(client, payload);
  }
};

const bindEvents = () => {
  if (eventsBound) {
    return;
  }

  eventBus.on("student.created", (student) => {
    broadcast({ event: "created", data: student });
  });

  eventBus.on("student.updated", (student) => {
    broadcast({ event: "updated", data: student });
  });

  eventBus.on("student.deleted", ({ id }) => {
    broadcast({ event: "deleted", id });
  });

  eventsBound = true;
};

export const websocketRoutes = async (fastify) => {
  bindEvents();

  fastify.get("/ws", { websocket: true }, async (socket, request) => {
    clients.add(socket);

    socket.on("close", () => {
      clients.delete(socket);
    });

    const students = await studentRepository.findAll();
    const data = students.map((student) => withImageUrl(request, student));

    sendJson(socket, { event: "init", data });
  });
};
