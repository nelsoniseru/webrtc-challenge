import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as io from 'socket.io-client';
import Peer, { MediaConnection } from 'peerjs';
interface RemoteStream {
  userId: string;
  stream: MediaStream;
}
@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})

export class RoomComponent implements OnInit, OnDestroy {
  @ViewChild('localVideo', { static: true }) localVideoRef!: ElementRef;

  private roomId!: string;
  private socket!: any;
  private peer!: Peer;
  private localStream!: MediaStream;
  private peerConnections: { [userId: string]: MediaConnection } = {};

  constructor(private route: ActivatedRoute) { }

  
  remoteStreams: RemoteStream[] = [];

  ngOnInit(): void {
    this.roomId = this.route.snapshot.paramMap.get('id') || '';
    console.log(this.roomId)
    const localVideo = this.localVideoRef.nativeElement;
    this.peer = new Peer(this.generateRandomUserId());


    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        this.localStream = stream;
        localVideo.srcObject = stream;
        this.peer.on('call', call => {
          call.answer(this.localStream); // Answer the incoming call with local stream
          this.handleIncomingCall(call.peer, call);
        });
      

        this.socket = io.connect('http://localhost:8080');
        this.socket.emit('join-room', this.roomId, this.peer.id);

        this.socket.on('user-connected', (userId:string)=> {
          this.connectToNewUser(userId);
        });

        this.socket.on('user-disconnected',(userId:string)=> {
          this.handleUserDisconnected(userId);
        });
      })
      .catch(error => {
        console.error('Error accessing media devices:', error);
      });
  }

  ngOnDestroy(): void {
    this.peer.destroy();
    this.socket.disconnect();
  }
  connectToNewUser(userId: string): void {
    if (!this.peerConnections[userId]) {
      const call = this.peer.call(userId, this.localStream); // Call using localStream
      this.handleIncomingCall(userId, call); // Pass userId to handleIncomingCall
    }
  }
  handleIncomingCall(userId: string, call:MediaConnection): void {
    call.on('stream', remoteStream => {
      if (!this.remoteStreams.find(x=>x.userId == userId)) {
        this.remoteStreams.push({ userId, stream: remoteStream })

      }
    });
  
    this.peerConnections[userId] = call;
  }
  
  handleUserDisconnected(userId: string): void {
    if (this.peerConnections[userId]) {
      this.peerConnections[userId].close();
      delete this.peerConnections[userId];
      this.removeRemoteStream(userId);
    }
  }
  
  removeRemoteStream(userId: string): void {
    this.remoteStreams = this.remoteStreams.filter(stream => stream.userId !== userId);
  }
  private generateRandomUserId(): string {
    return Math.random().toString(36).substr(2, 10); 
  }
}