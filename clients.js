module.exports = clients;

function clients() {
    this.garage = {
        label: 'Garage Opener',
        icon: 'icon_garage.png',
        // Available triggers to send alerts
        triggers: {
            opened: {label: 'Open'},
            closed: {label: 'Closed'}
        },
        // Controls for all Garage Door functions
        controls: {
            refresh: {label: 'Refresh', action: 'STATUS', icon: 'refresh'},
            change: {label: 'Change', action: 'CHANGE', icon: 'arrow-u', css: 'background-color:#FF9B9B;'}
        }
    };
}
