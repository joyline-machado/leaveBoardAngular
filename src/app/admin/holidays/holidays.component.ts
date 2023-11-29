import { Component, TemplateRef, OnInit } from '@angular/core';
import { Firestore, collection, collectionData} from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from 'src/app/shared/data.service';
import { AddHolidayComponent } from './add-holiday/add-holiday.component';
import { Observable, map } from 'rxjs';
import { CalendarOptions, EventInput, } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-holidays',
  templateUrl: './holidays.component.html',
  styleUrls: ['./holidays.component.scss']
})
export class HolidaysComponent implements OnInit {

  isLoading: boolean = true;
  isDeleting: boolean = false;

  holidaysData!: Observable<any[]>;
  newHolidaysData!: Observable<any[]>;


  constructor(public dialog: MatDialog,
    private dataService: DataService,
    private firestore: Firestore,
    private changeDetectorRef : ChangeDetectorRef
  ) {
    this.getHolidaysData();
  }

  ngOnInit(): void {
   

    
  }


  openDialog() {
    this.dialog.open(AddHolidayComponent, {
      width: '65%',
      height: '350px'
    });
  }

  calendarOptions: CalendarOptions = {
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    weekends: true,
    events: [],
    eventContent: this.renderEventContent,
    // eventClick: this.handleDateClick.bind(this)
  };
  eventsPromise!: Promise<EventInput>;


  

  renderEventContent(info: any) {
    const eventImage = info.event.extendedProps.image;
    const imageTag = eventImage ? `<img src="${eventImage}" class="event-image" />` : '';
    return `<div>${info.event.title}</div><div>${imageTag}</div>`;

  }

  getHolidaysData() {
    this.isLoading = true;
    const collectionInstance = collection(this.firestore, 'Holidays');
    collectionData(collectionInstance).subscribe(val => {
      // console.log(val);
      
      this.changeDetectorRef.detectChanges();
      this.isLoading = false;
    })
    this.holidaysData = collectionData(collectionInstance, { idField: 'id' });

    this.newHolidaysData = collectionData(collectionInstance, { idField: 'id' }).pipe(
      map((data: any[]) => {
        const currentDate = new Date();

        const filteredHolidays = data.filter((holiday) => {
          const holidayDate = holiday.holidayDate.toDate();
          return holidayDate >= currentDate;
        });

        return filteredHolidays.sort((a, b) => a.holidayDate.toDate() - b.holidayDate.toDate());

      })
    );



    this.holidaysData.subscribe(val => {
      const events = val.map(holiday => ({
        title: holiday.holidayOccasion,
        id: holiday.id,
        date: holiday.holidayDate.toDate(),
        allDay: true,
        backgroundColor: '#0097a7',
        borderColor: '#00796b',
        textColor: '#FFFFFF',
        extendedProps: {
          image: holiday.holidayImage
        },
        image: holiday.holidayImage
      }));

      this.calendarOptions.events = events;
    });

  }

  onEventClick(clickedEvent: any) {

    const eventId = clickedEvent.extendedProps.eventId;

    if (eventId) {
      // this.router.navigate(['edit-holiday', eventId], { relativeTo: this.route });
      // this.openEditPopup(id)
    }
  }

  openEditPopup(id: string) {
    const dialogRef = this.dialog.open(AddHolidayComponent, {
      width: '60%',
      height: '350px',
      data: { id }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Edited data:', result);

      }
      else {
        console.log({ id })
      }
    });
  }

  deleteHoliday(id: string) {
    this.isDeleting = true
    this.dataService.deleteHoliday(id);
    this.isDeleting = false
  }

  openDeleteDialog(ref: TemplateRef<any>, id: string) {
    this.dialog.open(ref, {
      data: { id }
    });
  }


}
