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

// **********************************
// ********** GARAGE SETUP **********
// **********************************

clients.prototype.changeButton = function(door) {
    if (door.Status = 'Open') {
        this.garage.controls.change.label = 'Close!';
        this.garage.controls.change.icon = 'arrow-d';cd 
        this.garage.controls.change.css = 'background-color:#FF9B9B;';
    } else {
        this.garage.controls.change.label = 'Open!';
        this.garage.controls.change.icon = 'arrow-u';
        this.garage.controls.change.css = 'background-color:#9BFFBE;color:#000000';
    }
}
