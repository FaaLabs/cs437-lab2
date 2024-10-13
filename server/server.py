import socket
from picarx import Picarx
from time import sleep
import json

HOST = "192.168.1.86"  # IP address of your Raspberry PI
PORT = 65432  # Port to listen on (non-privileged ports are > 1023)
KEY_TO_DIR_MAP = {
    "w": "forward",
    "s": "backwards",
    "d": "turn right",
    "a": "turn left",
}
SPEED = 40


def move_car(key, px):
    print(KEY_TO_DIR_MAP.get(key))
    px.set_dir_servo_angle(0)

    if "w" == key:
        px.set_dir_servo_angle(0)
        px.forward(SPEED)
    elif "s" == key:
        px.set_dir_servo_angle(0)
        px.backward(SPEED)
    elif "a" == key:
        px.set_dir_servo_angle(-35)
        px.forward(SPEED)
    elif "d" == key:
        px.set_dir_servo_angle(35)
        px.forward(SPEED)

    sleep(0.5)
    px.forward(0)


def get_car_info(px, key):
    distance = round(px.ultrasonic.read(), 2)
    direction = KEY_TO_DIR_MAP.get(key, "N/A")
    gm_val_list = px.get_grayscale_data()
    cliff_status = px.get_cliff_status(gm_val_list)

    return {
        "cliff_status": cliff_status,
        "moving_direction": direction,
        "object_distance": distance,
    }


if __name__ == "__main__":
    px = Picarx()
    px.set_cliff_reference([200, 200, 200])

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((HOST, PORT))
        s.listen()
        print("server listening...")

        try:
            while 1:
                client, clientInfo = s.accept()
                print("server recv from: ", clientInfo)
                data = client.recv(
                    1024
                )  # receive 1024 Bytes of message in binary format
                print("received data: ", data)
                key = data.decode("ascii")
                if key in ["a", "s", "d", "w", "q"]:
                    if key == "q":
                        px.forward(0)
                        sleep(0.5)
                        break
                    move_car(key, px)
                    car_info = get_car_info(px, key)
                    data_to_send = str.encode(json.dumps(car_info))
                    print("sending info: ", data_to_send)
                    client.sendall(data_to_send)  # Echo back to client

        except:
            print("Closing socket")
            client.close()
            s.close()
