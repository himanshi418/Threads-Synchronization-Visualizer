# Threads-Synchronization-Visualizer

## Project Overview
Thread Synchronization Visualizer is an interactive web-based project developed to demonstrate important thread synchronization mechanisms such as Mutex, Semaphore, and Monitor. The project helps users understand how multiple threads access a shared resource, how waiting and blocking occur, and how synchronization prevents race conditions in concurrent systems.

## Objectives
- To visualize thread synchronization in an interactive way.
- To demonstrate Mutex, Semaphore, and Monitor mechanisms.
- To compare synchronized and unsynchronized execution.
- To show thread states such as Ready, Waiting, Running, Critical, and Finished.
- To provide analytical charts and logs for better understanding.

## Technologies Used
- HTML
- CSS
- JavaScript
- Chart.js
- GitHub for revision tracking and collaboration

## Project Modules

### 1. GUI Module
This module provides the dashboard-style interface, control panel, simulation workspace, dark mode theme, and custom project icon.

### 2. Simulation Logic Module
This module implements the execution logic for thread synchronization using Mutex, Semaphore, Monitor, and unsynchronized mode.

### 3. Charts and Analysis Module
This module provides event logs, thread state summary, performance summary chart, and recommendation/statistics display.

## Features
- Interactive mechanism selection
- Thread count selection
- Semaphore limit selection
- Start, Pause, and Reset controls
- Thread state visualization
- Shared resource visualization
- Mutex simulation
- Semaphore simulation
- Monitor simulation
- Unsynchronized execution demonstration
- Event log with colored messages
- Thread state graph
- Performance summary graph
- Custom icon and dark mode UI

## Team Members
- Member 1: UI Design and Layout
- Member 2: Simulation Logic
- Member 3: Charts, Logs, and Analysis

## GitHub Workflow
The project was managed using GitHub with revision tracking and branch-based collaboration.

### Branches Used
- `main` - final stable version
- `ui-design` - user interface and styling changes
- `simulation-logic` - thread synchronization logic
- `charts-analysis` - graphs, logs, and performance analysis

### Revision Tracking
The repository was updated regularly with clear commit messages to show project progress. More than 7 revisions were maintained during development.

### Merge Strategy
Features were developed and tested in separate branches, then merged into the `main` branch after validation.

## How to Run the Project
1. Download or clone the repository.
2. Open the project folder.
3. Open `index.html` in a web browser.
4. Select synchronization mechanism and start the simulation.

## Learning Outcomes
This project helps users understand:
- thread behavior in concurrent systems
- race conditions
- mutual exclusion
- controlled resource sharing
- synchronization techniques and their impact

## Conclusion
This project successfully demonstrates thread synchronization concepts using an interactive and visually engaging interface. It combines simulation, analysis, and modern UI design to make concurrency control easier to understand for students and beginners.
