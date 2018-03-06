# Thunderbird Taiga Integration
 
Convert Thunderbirds mails to user stories, tasks and tickets for the [Taiga project management system](https://taiga.io).

## Links

- <https://addons.mozilla.org/de/thunderbird/addon/thunderbird-taiga-integration/>
- <http://pehei.de/software/thunderbird-taiga-integration>
- <https://github.com/phdd/thunderbird-taiga-integration>

## Token Authentication

Since Taiga's application token flow is unusable, authentication is done via the user's Bearer-Token.
To obtain this token open the developer console and get it from the application's local storage.
The following screencast illustrates this slightly hacky solution.

![Obtain User Token](https://github.com/phdd/thunderbird-taiga-integration/blob/master/res/token-screencast.gif)

## Screenshots

![Create Taiga Ticket](https://github.com/phdd/thunderbird-taiga-integration/blob/master/res/ticket.png)

## License

    (c) Peter Heisig 2018

    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at http://mozilla.org/MPL/2.0/.
