import { Overlay, OverlayContainer, OverlayModule } from '@angular/cdk/overlay';
import { CdkPortal, PortalModule } from '@angular/cdk/portal';
import { Component, NgModule, ViewChild, ViewContainerRef } from '@angular/core';
import { async, inject, TestBed } from '@angular/core/testing';
import { CdkOverlayContainerOverride } from './cdk-overlay-container-override';

describe('CdkOverlayContainerOverride', () => {
  let overlay: Overlay;
  let overlayContainer: OverlayContainer;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [OverlayTestModule],
      providers: [{ provide: OverlayContainer, useClass: CdkOverlayContainerOverride }]
    }).compileComponents();
  }));

  beforeEach(inject([Overlay, OverlayContainer], (o: Overlay, oc: OverlayContainer) => {
    overlay = o;
    overlayContainer = oc;
  }));

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  it('should remove the overlay container element from the DOM on destruction', () => {
    const fixture = TestBed.createComponent(TestComponentWithTemplatePortals);
    const overlayRef = overlay.create();
    overlayRef.attach(fixture.componentInstance.templatePortal);
    fixture.detectChanges();
    expect(document.querySelector('.cdk-overlay-container')).not.toBeNull(
      'Expected the overlay container to be in the DOM after opening an overlay'
    );
    // Manually call `ngOnDestroy` because there is no way to force Angular to destroy an
    // injectable in a unit test.
    overlayContainer.ngOnDestroy();
    expect(document.querySelector('.cdk-overlay-container')).toBeNull(
      'Expected the overlay container *not* to be in the DOM after destruction'
    );
  });

  it('should add and remove css classes from the container element', () => {
    overlayContainer.getContainerElement().classList.add('commander-shepard');
    const containerElement = document.querySelector('.cdk-overlay-container')!;
    expect(containerElement.classList.contains('commander-shepard')).toBe(
      true,
      'Expected the overlay container to have class "commander-shepard"'
    );
    overlayContainer.getContainerElement().classList.remove('commander-shepard');
    expect(containerElement.classList.contains('commander-shepard')).toBe(
      false,
      'Expected the overlay container not to have class "commander-shepard"'
    );
  });

  it('should remove overlay containers from the server when on the browser', () => {
    const extraContainer = document.createElement('div');
    extraContainer.classList.add('cdk-overlay-container');
    extraContainer.setAttribute('platform', 'server');
    document.body.appendChild(extraContainer);

    overlayContainer.getContainerElement();
    expect(document.querySelectorAll('.cdk-overlay-container').length).toBe(1);
    if (extraContainer.parentNode) {
      extraContainer.parentNode.removeChild(extraContainer);
    }
  });

  it('should remove overlay containers from other unit tests', () => {
    const extraContainer = document.createElement('div');
    extraContainer.classList.add('cdk-overlay-container');
    extraContainer.setAttribute('platform', 'test');
    document.body.appendChild(extraContainer);

    overlayContainer.getContainerElement();
    expect(document.querySelectorAll('.cdk-overlay-container').length).toBe(1);

    if (extraContainer.parentNode) {
      extraContainer.parentNode.removeChild(extraContainer);
    }
  });

  it('should not remove extra containers that were created on the browser', () => {
    const extraContainer = document.createElement('div');
    extraContainer.classList.add('cdk-overlay-container');
    document.body.appendChild(extraContainer);

    overlayContainer.getContainerElement();

    expect(document.querySelectorAll('.cdk-overlay-container').length).toBe(2);

    extraContainer.parentNode!.removeChild(extraContainer);
  });
});

/** Test-bed component that contains a TemplatePortal and an ElementRef. */
@Component({
  template: `<ng-template cdk-portal>Cake</ng-template>`,
  providers: [Overlay]
})
class TestComponentWithTemplatePortals {
  @ViewChild(CdkPortal, { static: true }) templatePortal: CdkPortal;
  constructor(public viewContainerRef: ViewContainerRef) {}
}
@NgModule({
  imports: [OverlayModule, PortalModule],
  declarations: [TestComponentWithTemplatePortals]
})
class OverlayTestModule {}
