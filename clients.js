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
            change: {label: 'Change', action: 'CHANGE', icon: 'arrow-u', css: 'background-color:#FF9B9B;'},
            photo: {label: 'Photo', action: 'PHOTO', icon: null}
        }
    };
    this.sprinkler = {
        label: 'Sprinkler System',
        icon: null,
        // Available triggers to send alerts
        triggers: {
            watering: {label: 'Watering'}
        },
        // Controls for all Garage Door functions
        controls: {
            refresh: {label: 'Refresh', action: 'STATUS', icon: 'refresh'},
            run: {label: 'Run', action: 'RUN', icon: 'arrow-u', css: 'background-color:#FF9B9B;'}
        }
    };
    this.alarm = {
        label: 'Alarm System',
        icon: null,
        // Available triggers to send alerts
        triggers: {
            alarm: {label: 'Alarm'}
        },
        // Controls for all Garage Door functions
        controls: {
            refresh: {label: 'Refresh', action: 'STATUS', icon: 'refresh'},
            arm: {label: 'Arm', action: 'ARM', icon: 'arrow-u', css: 'background-color:#FF9B9B;'}
        }
    };
}
