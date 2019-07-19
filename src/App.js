import React, {Component} from 'react';
import './App.css';
import {Card, SwitchField, Accordion, AccordionItem, OutlinedButton, AsyncAutocompleteField} from 'luna-react';
import {TableContainer, TableBody, TableRow, TableCell, TableHeaderRow, TableHeaderCell, ProgressIndicator, ProgressBar} from "luna-react";
import { withLabel, Sainsburys } from 'luna-images';
import Time from 'react-time';
import Clock from 'react-live-clock'
import moment from 'moment'


const SainsburysLogo = withLabel(Sainsburys);
const { Search } = require('luna-icons')

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      value: '', storeName: '', storeAddress: '', storeCountry: '', storePostCode: '', storeTelephone: '', storeManager: '', openingHours: [], search: [], latitude: '', 
      longitude: '', localHours: [], selectedStore: '', loading: false, loadingLocal: false, showHFC: false, openNow: false
  }
    this.onClick = this.onClick.bind(this);
    this.getLocalStore = this.getLocalStore.bind(this);
    this.getMultipleStores = this.getMultipleStores.bind(this);
    this.searchStores = this.searchStores.bind(this);
    this.selectStore = this.selectStore.bind(this);
    this.onChangeHFC = this.onChangeHFC.bind(this);
  }

   componentWillMount() {
    if (window.navigator.geolocation) {
     window.navigator.geolocation.getCurrentPosition(this.locationSuccess, this.locationError)
    }
  }

  locationSuccess = (location) => {
    this.setState({ latitude: location.coords.latitude, longitude: location.coords.longitude })
      console.log(this.state.latitude, this.state.longitude)
    this.getLocalStore()
  }

  locationError = (error) => {
    console.log("Location Services Currently Unavailable");
    }

  updateLocation(data) {
    this.setState({ 
      localName: data.other_name,
      localAddress: data.contact.address1,
      localCity: data.contact.city,
      localCountry: data.contact.country,
      localPostCode: data.contact.post_code,
      localTelephone: data.contact.telephone,
      localManager: data.contact.manager,
      localHours: data.opening_times});
    this.setState({loadingLocal: false})
  }

  
  async getLocalStore() {
    let openNow = moment().format('YYYY-MM-DD HH:mm')
    this.setState({loadingLocal: true})
    const response = await fetch(`https://api.stores.sainsburys.co.uk/v1/stores/?sort=by_distance&lat=${this.state.latitude}&lon=${this.state.longitude}&facility=Hot+Food+Counter&open_at=${openNow}`);
    return await response.json().then(data => this.updateLocation(data.results[0]))
  }

  updateStoreInfo (storeData) {
    this.setState({
        storeName: storeData.store.name,
        storeAddress: storeData.store.contact.address1,
        storeCity: storeData.store.contact.city,
        storeCountry: storeData.store.contact.country,
        storePostCode: storeData.store.contact.post_code,
        storeTelephone: storeData.store.contact.telephone,
        storeManager: storeData.store.contact.manager,
        openingHours: storeData.store.opening_times});
    this.setState({loading: false})
  }
  
  displayPlaces() {
  const type = 
  this.state.inputData.map((typeData) =>
    <li key={typeData.other_name}>{typeData.other_name}</li>
  );
  return type;
}

  displayOpeningTimes() {
    const weekday=new Array(7);
    weekday[0]="Monday";
    weekday[1]="Tuesday";
    weekday[2]="Wednesday";
    weekday[3]="Thursday";
    weekday[4]="Friday";
    weekday[5]="Saturday";
    weekday[6]="Sunday";

    const list = 
    this.state.openingHours.map((openingSlot) =>
      <TableRow key={openingSlot.day}> 
        <TableCell>
            {weekday[openingSlot.day]}
        </TableCell> 

        <TableCell> 
            {openingSlot.start_time} - {openingSlot.end_time} 
        </TableCell> 
    </TableRow>
    );
    return list;
  }

  displayLocalOpeningTimes() {
    const weekday=new Array(7);
    weekday[0]="Monday";
    weekday[1]="Tuesday";
    weekday[2]="Wednesday";
    weekday[3]="Thursday";
    weekday[4]="Friday";
    weekday[5]="Saturday";
    weekday[6]="Sunday";

    const list = 
    this.state.localHours.map((openingSlot) =>
      <TableRow key={openingSlot.day}> 
        <TableCell>
            {weekday[openingSlot.day]}
        </TableCell> 

        <TableCell> 
            {openingSlot.start_time} - {openingSlot.end_time} 
        </TableCell> 
      </TableRow>
    );
    return list;
  }

  async onClick () {
    if(this.state.value === "") {
        return;
    }
    this.setState({loading: true})
    if (isNaN(this.state.value) === false) {
    const response = await fetch(`https://api.stores.sainsburys.co.uk/v1/stores/${this.state.value}`);
    await response.json().then(data => this.updateStoreInfo(data))
    }
    else {
    const response = await fetch(`https://api.stores.sainsburys.co.uk/v1/stores/?complete=${this.state.value}`);
    await response.json().then(stores => this.getMultipleStores(stores))
    }
  }

  getMultipleStores(data) {
      console.log("Multiple Stores", data);
      this.setState({ stores: data.results.map((store) =>
        <div  key={store.code}>
          <li>{store.other_name}</li>
          <li >{store.code}</li>
        </div>
      )})
  }

  handleChange(event) {
    console.log(event.target.value);
    this.setState({selectedStore: event.target.value,
      value: event.target.value
    });
  }

  searchStores(event) {
    this.setState({selectedStore: event.target.value})
  }

  selectStore(event) {
    if(event === null) {
      return;
    }
    this.setState({value: event.value})
  }

  onChangeHFC(event) {
    if(event.currentTarget.id === "switchField-hotFood") {
    this.setState({showHFC: !this.state.showHFC})
  }
    else{
      this.setState({openNow: !this.state.openNow})
    }
  }


render() {
  let openNow = moment().format('YYYY-MM-DD HH:mm')

  const loadOptions = async value => {
  let url = `https://api.stores.sainsburys.co.uk/v1/stores/?complete=${value}`;
  if(this.state.showHFC === true) {
    url = `https://api.stores.sainsburys.co.uk/v1/stores/?complete=${value}&facility=Hot+Food+Counter`
  } 
  if(this.state.openNow === true) {
    url = `https://api.stores.sainsburys.co.uk/v1/stores/?complete=${value}&open_at=${openNow}`
  }
  if(this.state.openNow && this.state.showHFC === true)
  url = `https://api.stores.sainsburys.co.uk/v1/stores/?complete=${value}&facility=Hot+Food+Counter&open_at=${openNow}`
  return await fetch(url)
    .then(response => response.json())
    .then(response =>
      response.results.map(item => ({
        label: item.other_name,
        value: item.code,
      })),
    )}

    let now = new Date()

  return (
    <div className="App">

          <Card className="Logo">
            <SainsburysLogo label="Sainsburys Group plc" width="320px" />
            <p className="Subtitle">Pizza Locator</p>
                <p className="Date">
                  <Time value={now} format="dddd Do MMMM YYYY" /> <br />
                  <Clock format={'h:mm A'} ticking={true} timezine={'US/Pacific'} />
                </p>
          </Card>

          <Accordion multipleOpen titleElement="h3">
            <AccordionItem className="Containers" title="Search Stores">

            <p className="Search">Search:</p>
          
            <SwitchField
              name="switchField"
              className="Switch"
              onChange={this.onChangeHFC}
              listType="inline"
              options={[
                { value: 'hotFood',       label: 'Show Stores With Hot Food Counters' },
                { value: 'openStoreNow',  label: 'Show Stores Open Now' }
              ]}
            />

            <AsyncAutocompleteField
              name="async-autocomplete-field-1"
              label=""
              placeholder="Search Sainsbury's Stores..."
              loadOptions={loadOptions}
              onChange={this.searchStores}
              onSelect={this.selectStore}
              minChars={3}
                />

              <OutlinedButton 
                className="SearchButton"
                onClick={this.onClick}>
                  <Search /> Search
              </OutlinedButton> 
            </AccordionItem>

            <AccordionItem className="Containers" title="Search Results">
                  <div> 
                    <p className="Search">Search Results:</p>
                    <p>{this.state.stores}</p>

              { this.state.loading === false && 
              <div>
                { this.state.storeName !== "" ? <div>
                <TableContainer className="LocalTable">
                <TableBody>

                  { this.state.storeName !== "" && 
                    <TableRow>
                      <TableCell> Store Name: </TableCell> 
                      <TableCell> {this.state.storeName} </TableCell> 
                    </TableRow> }

                  { this.state.storeAddress !== "" && 
                    <TableRow> 
                      <TableCell> Store Address: </TableCell> 
                      <TableCell> {this.state.storeAddress} </TableCell> 
                    </TableRow> }

                    { this.state.storeCity !== "" && 
                    <TableRow>
                      <TableCell> Store Town/City: </TableCell> 
                      <TableCell> {this.state.storeCity} </TableCell> 
                    </TableRow> }

                  { this.state.storeCountry !== "" && 
                    <TableRow>
                      <TableCell> Store Country: </TableCell> 
                      <TableCell> {this.state.storeCountry} </TableCell> 
                    </TableRow> } 

                  { this.state.storePostCode !== "" && 
                    <TableRow>
                      <TableCell> Store Post Code: </TableCell> 
                      <TableCell> {this.state.storePostCode} </TableCell> 
                    </TableRow> }

                  { this.state.storeTelephone !== "" && 
                    <TableRow>
                      <TableCell> Store Telephone Number: </TableCell> 
                      <TableCell> {this.state.storeTelephone} </TableCell> 
                    </TableRow> }

                  { this.state.storeManager !== "" && 
                    <TableRow>
                      <TableCell> Store Manager: </TableCell> 
                      <TableCell> {this.state.storeManager} </TableCell> 
                    </TableRow> }
                </TableBody>
          </TableContainer> <br/>

          <p className="Time">Current Time- <Clock format={'HH:mm'} ticking={true} timezine={'US/Pacific'} /> <br /></p>

              <TableContainer className="Table">
                <TableBody>
                  <TableHeaderRow>
                    <TableHeaderCell>Week Days: </TableHeaderCell>
                    <TableHeaderCell>Opening Hours: </TableHeaderCell>
                  </TableHeaderRow>
                  {this.displayOpeningTimes()}
                </TableBody>
          </TableContainer>
                  </div> :  <div>
                              <h6 className="NoResults">No Search Results!</h6>
                              <p className="NoResults"> Use search area to search for any Sainsbury's store and results will be shown here. </p> 
                            </div> }
                        </div> }

                  { this.state.loading === true && <div>
                          <ProgressIndicator loading preventFocus>
                            <ProgressBar className="ln-u-push-bottom-sm" />
                            <ProgressBar small />
                          </ProgressIndicator> 
                          <h3 className="Loading"> ...LOADING... </h3> 
                      </div> }
                  </div>
            </AccordionItem>

            <AccordionItem className="Containers" title="Your Local Store">

            <p className="Search">Your Local Store: </p>

        { this.state.loadingLocal === false && 
          <div>
            <TableContainer className="LocalTable">
                <TableBody>
                  { this.state.localName !== "" && 
                    <TableRow> 
                      <TableCell> Local Store: </TableCell> 
                      <TableCell> {this.state.localName} </TableCell> 
                    </TableRow> }

                  { this.state.localAddress !== "" && 
                    <TableRow>
                      <TableCell> Local Stores Address: </TableCell> 
                      <TableCell> {this.state.localAddress} </TableCell> 
                    </TableRow> }

                  { this.state.localCity !== "" && 
                    <TableRow>
                      <TableCell> Local Stores Town / City: </TableCell> 
                      <TableCell> {this.state.localCity} </TableCell> 
                    </TableRow> } 

                  { this.state.localCountry !== "" && 
                    <TableRow>
                      <TableCell> Local Stores Country: </TableCell> 
                      <TableCell> {this.state.localCountry} </TableCell> 
                    </TableRow> }

                  { this.state.localPostCode !== "" && 
                    <TableRow>
                      <TableCell> Local Stores Post Code: </TableCell> 
                      <TableCell> {this.state.localPostCode} </TableCell> 
                    </TableRow> }

                  { this.state.localTelephone !== "" && 
                    <TableRow>
                      <TableCell> Local Stores Telephone Number: </TableCell> 
                      <TableCell> {this.state.localTelephone} </TableCell> 
                    </TableRow> }

                  { this.state.localManager !== "" && 
                    <TableRow>
                      <TableCell> Local Stores Manager: </TableCell> 
                      <TableCell> {this.state.localManager} </TableCell> 
                    </TableRow> }
                </TableBody>
          </TableContainer> <br/>

          <p className="Time">Current Time- <Clock format={'HH:mm'} ticking={true} timezine={'US/Pacific'} /> <br /> </p>

              <TableContainer className="Table">
                <TableBody>
                  <TableHeaderRow>
                    <TableHeaderCell>Week Days: </TableHeaderCell>
                    <TableHeaderCell>Opening Hours: </TableHeaderCell>
                  </TableHeaderRow>
                    {this.displayLocalOpeningTimes()}
                </TableBody>
              </TableContainer> 
        </div> }

        { this.state.loadingLocal === true && 
          <div>
            <ProgressIndicator loading preventFocus>
              <ProgressBar 
className="ln-u-push-bottom-sm" />
              <ProgressBar small />
            </ProgressIndicator> 
            <h3 className="Loading"> ...LOADING... </h3> 
        </div> }
            </AccordionItem> 
          </Accordion> 
    </div>
  );
}}

export default App;
