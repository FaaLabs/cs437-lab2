const server_port = 65432;
const server_addr = '192.168.1.86';   // the IP address of your Raspberry PI
const log = require('electron-log');
const net = require('net');

const KEY_DIR_MAP = {
  'w': 'up',
  's': 'down',
  'd': 'right',
  'a': 'left',
}

function set_data_from_server(dict) {
  const obj = JSON.parse(dict)
  document.getElementById('car_cliff_status').innerHTML = obj.cliff_status;
  document.getElementById('car_direction').innerHTML = obj.moving_direction;
  document.getElementById('car_object_distance').innerHTML = obj.object_distance;
}


function send_data(data) {
  // create client connection
  const client = net.createConnection({ port: server_port, host: server_addr }, () => {
    log.info('connected to server!');
    client.write(data)
    log.info(`sent data: ${data}`)
    client.end()
  });

  // get the data from the server
  client.on('data', (data) => {
    log.info(`received data: ${data}`);
    set_data_from_server(data)
  });

  // log end message
  client.on('end', () => {
    log.info('server is disconnected');
  });

}

function get_color_by_id(id, pressed_id) {
  if (id === pressed_id) {
    return '#009bf5'
  }
  return '#4ec1ff'
}

document.addEventListener('keydown', function (event) {
  const key = event.key.toLowerCase();

  if (['a', 's', 'd', 'w', 'q'].includes(key)) {
    log.info(`Key '${key}' pressed`);

    // sends data to server (RPI)
    send_data(key); 

    // change UI key colors
    let pressed_element_id = `${KEY_DIR_MAP[key]}-arrow`

    document.getElementById('up-arrow').style.backgroundColor = get_color_by_id('up-arrow', pressed_element_id);
    document.getElementById('up-arrow').style.borderColor = get_color_by_id('up-arrow', pressed_element_id);

    document.getElementById('down-arrow').style.backgroundColor = get_color_by_id('down-arrow', pressed_element_id);
    document.getElementById('down-arrow').style.borderColor = get_color_by_id('down-arrow', pressed_element_id);

    document.getElementById('left-arrow').style.backgroundColor = get_color_by_id('left-arrow', pressed_element_id);
    document.getElementById('left-arrow').style.borderColor = get_color_by_id('left-arrow', pressed_element_id);

    document.getElementById('right-arrow').style.backgroundColor = get_color_by_id('right-arrow', pressed_element_id);
    document.getElementById('right-arrow').style.borderColor = get_color_by_id('right-arrow', pressed_element_id);
  }

});
