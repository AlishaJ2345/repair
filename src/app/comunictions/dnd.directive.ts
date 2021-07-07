import { Directive, HostListener, HostBinding, EventEmitter, Output, Input, ChangeDetectorRef } from '@angular/core';

@Directive({
  selector: '[appDnd]'
})
export class DndDirective {
  @Input() private allowed_extensions : Array<string> = [];
  @Output() private filesChangeEmiter : EventEmitter<File[]> = new EventEmitter();
  @HostBinding('style.background') private background = '#eee';

  @HostListener('dragover', ['$event']) public onDragOver(evt){
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#99e699';
  }
  @HostListener('dragleave', ['$event']) public onDragLeave(evt){
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#eee'
  }
  @HostListener('drop', ['$event']) public onDrop(evt){
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#eee';
    let files = evt.dataTransfer.files;
    let valid_files: Array<File> = [];
    if(files.length > 0){
      for(let i =0;i<files.length;i++){
        let ext = files[i].name.split('.')[files[0].name.split('.').length - 1];
        if(this.allowed_extensions.lastIndexOf(ext) != -1){
          valid_files.push(files[i]);
          this.background = '#99e699';
          this.cdr.detectChanges();
        }
      }
      this.filesChangeEmiter.emit(valid_files);
    }
  }
  private fileList : any = [];
  constructor(private cdr:ChangeDetectorRef) { }

  onFilesChange(fileList : Array<File>){
    this.fileList = fileList;
  }
}
