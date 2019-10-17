import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleUsageComponent } from './simple-usage.component';

describe('SimpleUsageComponent', () => {
  let component: SimpleUsageComponent;
  let fixture: ComponentFixture<SimpleUsageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimpleUsageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleUsageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
